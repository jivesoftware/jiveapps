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
import com.jivesoftware.rest.quotes.dao.UserDAO;
import com.jivesoftware.rest.quotes.entity.UserEntity;
import com.jivesoftware.rest.quotes.model.User;
import com.jivesoftware.rest.quotes.model.impl.UserImpl;
import org.springframework.beans.factory.annotation.Required;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>User web service for quotes system.</p>
 */
@Path("/users")
public class UserServer {

    @DELETE
    @Path("/{userID}")
    public void delete(@PathParam("userID") long userID) {
        User user = userDAO.get(userID);
        if (user == null) {
            throw new NotFoundException("Missing user " + userID);
        }
        userDAO.delete(user);
    }

    @GET
    @Produces("application/json")
    public List<UserEntity> find() { // TODO - filtering and pagination
        List<User> matches = new ArrayList<User>();
        for (User user : userDAO.find()) {
            matches.add(user);
        }
        List<UserEntity> results = new ArrayList<UserEntity>();
        for (User user : matches) {
            UserEntity entity = new UserEntity(user);
            results.add(entity);
        }
        return results;
    }

    @GET
    @Path("/{userID}")
    @Produces("application/json")
    public UserEntity get(@PathParam("userID") long userID) {
        User user = userDAO.get(userID);
        if (user == null) {
            throw new NotFoundException("Missing user " + userID);
        }
        UserEntity entity = new UserEntity(user);
        return entity;
    }

    @POST
    @Consumes("application/json")
    public Response insert(@Context UriInfo uriInfo,
                           UserEntity entity) throws URISyntaxException {
        User user = new UserImpl();
        populate(user, entity);
        validate(user);
        userDAO.insert(user);
        return Response.created(uri(uriInfo, user)).build();
    }

    @DELETE
    public void reset() {
        userDAO.reset();
    }

    @PUT
    @Path("/{userID}")
    @Consumes("application/json")
    public void update(@PathParam("userID") long userID,
                       UserEntity entity) {
        User user = userDAO.get(userID);
        if (user == null) {
            throw new NotFoundException("Missing user " + userID);
        }
        populate(user, entity);
        validate(user);
        userDAO.update(user);
    }

    // ------------------------------------------------------------------------------------------------- Support Methods

    private void populate(User user, UserEntity entity) {
        user.setFirstName(entity.getFirstName());
        user.setLastName(entity.getLastName());
        user.setUsername(entity.getUsername());
    }

    private URI uri(UriInfo uriInfo, User user) throws URISyntaxException {
        URI uri = new URI(uriInfo.getRequestUri() + "/" + user.getID());
        return uri;
    }

    private void validate(User user){
        if ((user.getFirstName() == null) || (user.getFirstName().length() == 0)) {
            throw new BadRequestException("Missing first name");
        }
        if ((user.getLastName() == null) || (user.getLastName().length() == 0)) {
            throw new BadRequestException("Missing last name");
        }
        if ((user.getUsername() == null) || (user.getUsername().length() == 0)) {
            throw new BadRequestException("Missing username");
        }
    }

    // ----------------------------------------------------------------------------------------------------- Injectables

    private UserDAO userDAO;

    @Required
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

}
