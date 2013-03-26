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
import com.jivesoftware.rest.quotes.entity.UserEntity;
import com.jivesoftware.rest.quotes.model.Customer;
import com.jivesoftware.rest.quotes.model.impl.CustomerImpl;
import com.jivesoftware.rest.quotes.model.User;
import org.springframework.beans.factory.annotation.Required;

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
 * <p>Customer web service for quotes system.</p>
 */
@Path("/customers")
public class CustomerServer {

    @DELETE
    @Path("/{customerID}")
    public void delete(@PathParam("customerID") long customerID) {
        Customer customer = customerDAO.get(customerID);
        if (customer == null) {
            throw new NotFoundException("Missing customer " + customerID);
        }
        customerDAO.delete(customer);
    }

    @GET
    @Produces("application/json")
    public List<CustomerEntity> find(@QueryParam("accountNumber") @DefaultValue("") String accountNumber,
                                     @QueryParam("accountUsername") @DefaultValue("") String accountUsername,
                                     @QueryParam("offset") @DefaultValue("0") int offset,
                                     @QueryParam("limit") @DefaultValue("25") int limit,
                                     @QueryParam("order") @DefaultValue("name") String order,
                                     @QueryParam("direction") @DefaultValue("ascending") String direction) {
        // Filter for criteria
        List<Customer> matches = new ArrayList<Customer>();
        for (Customer customer : customerDAO.find()) {
            if (match(customer, accountNumber, accountUsername)) {
                matches.add(customer);
            }
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
        List<CustomerEntity> results = new ArrayList<CustomerEntity>();
        for (Customer customer : matches) {
            CustomerEntity entity = new CustomerEntity(customer);
            entity.setAccountUser(new UserEntity(userDAO.get(customer.getAccountUserID())));
            results.add(entity);
        }
        return results;
    }

    @GET
    @Path("/{customerID}")
    @Produces("application/json")
    public CustomerEntity get(@PathParam("customerID") long customerID) {
        Customer customer = customerDAO.get(customerID);
        if (customer == null) {
            throw new NotFoundException("Missing customer " + customerID);
        }
        CustomerEntity entity = new CustomerEntity(customer);
        entity.setAccountUser(new UserEntity(userDAO.get(customer.getAccountUserID())));
        return entity;
    }

    @POST
    @Consumes("application/json")
    public Response insert(@Context UriInfo uriInfo,
                           CustomerEntity entity) throws URISyntaxException {
        Customer customer = new CustomerImpl();
        populate(customer, entity);
        validate(customer);
        customerDAO.insert(customer);
        return Response.created(uri(uriInfo, customer)).build();
    }

    @DELETE
    public void reset() {
        customerDAO.reset();
    }

    @PUT
    @Path("/{customerID}")
    @Consumes("application/json")
    public void update(@PathParam("customerID") long customerID,
                       CustomerEntity entity) {
        Customer customer = customerDAO.get(customerID);
        if (customer == null) {
            throw new NotFoundException("Missing customer " + customerID);
        }
        populate(customer, entity);
        validate(customer);
        customerDAO.update(customer);
    }

    // ------------------------------------------------------------------------------------------------- Support Methods

    private boolean match(Customer customer, String accountNumber, String accountUsername) {
        if ((accountNumber != null) && (accountNumber.length() > 0)) {
            if (!accountNumber.equals(customer.getAccountNumber())) {
                return false;
            }
        }
        if ((accountUsername != null) && (accountUsername.length() > 0)) {
            User user = userDAO.get(customer.getAccountUserID());
            if (!accountUsername.equals(user.getUsername())) {
                return false;
            }
        }
        return true;
    }

    private void populate(Customer customer, CustomerEntity entity) {
        customer.setAccountNumber(entity.getAccountNumber());
        customer.setAccountUserID(entity.getAccountUser().getID());
        customer.setName(entity.getName());
    }

    private void sort(List<Customer> customers, String order, String direction) {
        CustomerComparator comparator = new CustomerComparator(order, direction);
        Collections.sort(customers, comparator);
    }

    private URI uri(UriInfo uriInfo, Customer customer) throws URISyntaxException {
        URI uri = new URI(uriInfo.getRequestUri() + "/" + customer.getID());
        return uri;
    }

    private void validate(Customer customer){
        if ((customer.getAccountNumber() == null) || (customer.getAccountNumber().length() == 0)) {
            throw new BadRequestException("Missing account number");
        }
        if (customer.getAccountUserID() < 0L) {
            throw new BadRequestException("Missing account user ID");
        }
        User user = userDAO.get(customer.getAccountUserID());
        if (user == null) {
            throw new BadRequestException("Invalid account user ID");
        }
        if ((customer.getName() == null) || (customer.getName().length() == 0)) {
            throw new BadRequestException("Missing customer name");
        }
    }

    private static class CustomerComparator implements Comparator<Customer> {

        public CustomerComparator(String order, String direction) {
            this.order = order;
            this.direction = direction;
        }

        private String order;
        private String direction;

        public int compare(Customer customer1, Customer customer2) {
            int result = 0;
            if ("accountNumber".equals(order)) {
                result = customer1.getAccountNumber().compareTo(customer2.getAccountNumber());
            }
            else if ("name".equals(order)) {
                result = customer1.getName().compareTo(customer2.getName());
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
