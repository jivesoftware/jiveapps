/**
  Copyright 2012 Jive Software

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
package com.jivesoftware.rest.quotes.server;

import com.jivesoftware.rest.exception.BadRequestException;
import com.jivesoftware.rest.exception.NotFoundException;
import com.jivesoftware.rest.quotes.dao.CustomerDAO;
import com.jivesoftware.rest.quotes.dao.LineDAO;
import com.jivesoftware.rest.quotes.dao.QuoteDAO;
import com.jivesoftware.rest.quotes.dao.UserDAO;
import com.jivesoftware.rest.quotes.entity.CustomerEntity;
import com.jivesoftware.rest.quotes.entity.LineEntity;
import com.jivesoftware.rest.quotes.entity.QuoteEntity;
import com.jivesoftware.rest.quotes.entity.UserEntity;
import com.jivesoftware.rest.quotes.model.Customer;
import com.jivesoftware.rest.quotes.model.Line;
import com.jivesoftware.rest.quotes.model.impl.LineImpl;
import com.jivesoftware.rest.quotes.model.Quote;
import com.jivesoftware.rest.quotes.model.impl.QuoteImpl;
import com.jivesoftware.rest.quotes.model.User;
import org.springframework.beans.factory.annotation.Required;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * <p>Quote web service for quotes system.</p>
 */
@Path("/quotes")
public class QuoteServer {

    @DELETE
    @Path("/{quoteID}")
    public void delete(@PathParam("quoteID") long quoteID) {
        Quote quote = quoteDAO.get(quoteID);
        if (quote == null) {
            throw new NotFoundException("Missing quote " + quoteID);
        }
        quoteDAO.delete(quote);
    }

    @GET
    @Produces("application/json")
    public List<QuoteEntity> find(@QueryParam("customerID") @DefaultValue("-1") long customerID,
                                  @QueryParam("status") @DefaultValue("") String status,
                                  @QueryParam("offset") @DefaultValue("0") int offset,
                                  @QueryParam("limit") @DefaultValue("25") int limit,
                                  @QueryParam("order") @DefaultValue("dueDate") String order,
                                  @QueryParam("direction") @DefaultValue("descending") String direction) {
        // Filter for criteria
        List<Quote> matches;
        if (customerID >= 0) {
            if ((status != null) && (status.length() > 0)) {
                matches = quoteDAO.find(customerID, status);
            }
            else {
                matches = quoteDAO.find(customerID);
            }
        }
        else if ((status != null) && (status.length() > 0)) {
            matches = quoteDAO.find(status);
        }
        else {
            matches = quoteDAO.find();
        }
        // Sort the resulting matches
        sort(matches, order, direction);
        // Filter for offset
        if (offset > 0) {
            for (int i = 0; i < offset; i++) {
                if (matches.size() < 1) {
                    break;
                }
                matches.remove(0);
            }
        }
        // Filter for limit
        while (matches.size() > limit) {
            matches.remove(matches.size() - 1);
        }
        // Format and return results
        List<QuoteEntity> results = new ArrayList<QuoteEntity>();
        for (Quote quote : matches) {
            quote.setLines(lineDAO.find(quote.getID()));
            QuoteEntity entity = new QuoteEntity(quote);
            entity.setCustomer(new CustomerEntity(customerDAO.get(quote.getCustomerID())));
            entity.setQuoteUser(new UserEntity(userDAO.get(quote.getQuoteUserID())));
            results.add(entity);
        }
        return results;
    }

    @GET
    @Path("/{quoteID}")
    @Produces("application/json")
    public QuoteEntity get(@PathParam("quoteID") long quoteID) {
        Quote quote = quoteDAO.get(quoteID);
        if (quote == null) {
            throw new NotFoundException("Missing quote " + quoteID);
        }
        quote.setLines(lineDAO.find(quote.getID()));
        QuoteEntity entity = new QuoteEntity(quote);
        entity.setCustomer(new CustomerEntity(customerDAO.get(quote.getCustomerID())));
        entity.setQuoteUser(new UserEntity(userDAO.get(quote.getQuoteUserID())));
        return entity;
    }

    @POST
    @Consumes("application/json")
    public Response insert(@Context UriInfo uriInfo,
                           QuoteEntity entity) throws URISyntaxException {
        // Populate and validate the new quote
        Quote quote = new QuoteImpl();
        populate(quote, entity);
        validate(quote);
        quoteDAO.insert(quote);
        // Add corresponding quote lines
        for (Line line : quote.getLines()) {
            line.setQuoteID(quote.getID());
            lineDAO.insert(line);
        }
        return Response.created(uri(uriInfo, quote)).build();
    }

    @DELETE
    @RolesAllowed({"ROLE_ADMIN"})
    public void reset() {
        quoteDAO.reset();
        lineDAO.reset();
    }

    @PUT
    @Path("/{quoteID}")
    @Consumes("application/json")
    public void update(@PathParam("quoteID") long quoteID,
                       QuoteEntity entity) {
        // Populate and validate the old quote
        Quote quote = quoteDAO.get(quoteID);
        if (quote == null) {
            throw new NotFoundException("Missing quote " + quoteID);
        }
        populate(quote, entity);
        validate(quote);
        quoteDAO.update(quote);
        // Delete previous quote lines for this quote
        List<Long> ids = new ArrayList<Long>();
        for (Line line : quote.getLines()) {
            ids.add(line.getID());
        }
        for (Long id : ids) {
            Line line = new LineImpl();
            line.setID(id);
            lineDAO.delete(line);
        }
        // Add corresponding quote lines from the new entity
        for (Line line : quote.getLines()) {
            line.setQuoteID(quote.getID());
            lineDAO.insert(line);
        }
    }

    @GET
    @Path("/{quoteID}/approve")
    @Produces("application/json")
    public QuoteEntity approve(@PathParam("quoteID") long quoteID) {
        return updateStatus(quoteID, "approved");
    }

    @GET
    @Path("/{quoteID}/reject")
    @Produces("application/json")
    public QuoteEntity reject(@PathParam("quoteID") long quoteID) {
        return updateStatus(quoteID, "rejected");
    }

    private QuoteEntity updateStatus(long quoteID, String status) {
        Quote quote = quoteDAO.get(quoteID);
        if (quote == null) {
            throw new NotFoundException("Missing quote " + quoteID);
        }
        quote.setStatus(status);
        validate(quote);
        quoteDAO.update(quote);
        QuoteEntity entity = new QuoteEntity(quote);
        entity.setCustomer(new CustomerEntity(customerDAO.get(quote.getCustomerID())));
        entity.setQuoteUser(new UserEntity(userDAO.get(quote.getQuoteUserID())));
        return entity;
    }

    // ------------------------------------------------------------------------------------------------- Support Methods

    private void populate(Quote quote, Line line, LineEntity entity) {
        line.setDescription(entity.getDescription());
        line.setLineNumber(entity.getLineNumber());
        line.setLinePrice(entity.getLinePrice());
        line.setSummary(entity.getSummary());
    }

    private void populate(Quote quote, QuoteEntity entity) {
        quote.setCustomerID(entity.getCustomer().getID());
        quote.setDescription(entity.getDescription());
        quote.setDueDate(entity.getDueDate());
        quote.setQuoteNumber(entity.getQuoteNumber());
        quote.setQuoteUserID(entity.getQuoteUser().getID());
        quote.setStatus(entity.getStatus());
        quote.setSummary(entity.getSummary());
        quote.setTotalPrice(entity.getTotalPrice());
        for (LineEntity lineEntity : entity.getLines()) {
            Line line = new LineImpl();
            populate(quote, line, lineEntity);
        }
    }

    private void sort(List<Quote> quotes, String order, String direction) {
        QuoteComparator comparator = new QuoteComparator(order, direction);
        Collections.sort(quotes, comparator);
    }

    private URI uri(UriInfo uriInfo, Quote quote) throws URISyntaxException {
        URI uri = new URI(uriInfo.getRequestUri() + "/" + quote.getID());
        return uri;
    }

    private void validate(Quote quote){
        if (quote.getCustomerID() < 0L) {
            throw new BadRequestException("Missing customer ID");
        }
        Customer customer = customerDAO.get(quote.getCustomerID());
        if (customer == null) {
            throw new BadRequestException("Invalid customer ID");
        }
        if (quote.getDueDate() < 0L) {
            throw new BadRequestException("Missing due date");
        }
        if ((quote.getQuoteNumber() == null) || (quote.getQuoteNumber().length() == 0)) {
            throw new BadRequestException("Missing quote number");
        }
        if (quote.getQuoteUserID() < 0L) {
            throw new BadRequestException("Missing quote user ID");
        }
        User user = userDAO.get(quote.getQuoteUserID());
        if (user == null) {
            throw new BadRequestException("Invalid quote user ID");
        }
        if ((quote.getStatus() == null) || (quote.getStatus().length() == 0)) {
            throw new BadRequestException("Missing status");
        }
        if (!"pending".equals(quote.getStatus()) && !"approved".equals(quote.getStatus()) && !"rejected".equals(quote.getStatus())) {
            throw new BadRequestException("Invalid status '" + quote.getStatus() + "'");
        }
        if ((quote.getSummary() == null) || (quote.getSummary().length() == 0)) {
            throw new BadRequestException("Missing summary");
        }
        if (quote.getTotalPrice() == null) {
            throw new BadRequestException("Missing total price");
        }
        for (Line line : quote.getLines()) {
            if (line.getLineNumber() < 0) {
                throw new BadRequestException("Missing line number");
            }
            if (line.getLinePrice() == null) {
                throw new BadRequestException("Missing line price");
            }
            if (line.getSummary() == null) {
                throw new BadRequestException("Missing line summary");
            }
        }
    }

    private static class QuoteComparator implements Comparator<Quote> {

        public QuoteComparator(String order, String direction) {
            this.order = order;
            this.direction = direction;
        }

        private String order;
        private String direction;

        public int compare(Quote quote1, Quote quote2) {
            int result = 0;
            if ("dueDate".equals(order)) {
                if (quote1.getDueDate() < quote2.getDueDate()) {
                    result = -1;
                }
                else if (quote1.getDueDate() > quote2.getDueDate()) {
                    result = 1;
                }
            }
            else if ("quoteNumber".equals(order)) {
                result = quote1.getQuoteNumber().compareTo(quote2.getQuoteNumber());
            }
            else if ("summary".equals(order)) {
                result = quote1.getSummary().compareTo(quote2.getSummary());
            }
            else if ("totalPrice".equals(order)) {
                result = quote1.getTotalPrice().compareTo(quote2.getTotalPrice());
            }
            if ("descending".equals(direction)) {
                result = -result;
            }
            return result;
        }

    }

    // ----------------------------------------------------------------------------------------------------- Injectables

    private CustomerDAO customerDAO;
    private LineDAO lineDAO;
    private QuoteDAO quoteDAO;
    private UserDAO userDAO;

    @Required
    public void setCustomerDAO(CustomerDAO customerDAO) {
        this.customerDAO = customerDAO;
    }

    @Required
    public void setLineDAO(LineDAO lineDAO) {
        this.lineDAO = lineDAO;
    }

    @Required
    public void setQuoteDAO(QuoteDAO quoteDAO) {
        this.quoteDAO = quoteDAO;
    }

    @Required
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

}
