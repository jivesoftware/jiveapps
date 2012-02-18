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

import com.jivesoftware.rest.quotes.dao.LineDAO;
import com.jivesoftware.rest.quotes.dao.QuoteDAO;
import org.springframework.beans.factory.annotation.Required;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

/**
 * <p>A web service that Google App Engine can call with a cron job, that can apparently only do GET calls.</p>
 */
@Path("/reset")
public class ResetServer extends AbstractServer {

    @GET
    // Give Google App Engine a GET target for a cron job
    public Response reset() {
        quoteDAO.reset();
        lineDAO.reset();
        return Response.noContent().build();
    }

    private LineDAO lineDAO;
    private QuoteDAO quoteDAO;

    @Required
    public void setLineDAO(LineDAO lineDAO) {
        this.lineDAO = lineDAO;
    }

    @Required
    public void setQuoteDAO(QuoteDAO quoteDAO) {
        this.quoteDAO = quoteDAO;
    }

}
