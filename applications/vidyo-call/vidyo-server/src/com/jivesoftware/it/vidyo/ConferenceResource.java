package com.jivesoftware.it.vidyo;

import com.vidyo.user.Entity;

import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.*;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;

/**
 * JAX-RS resource endpoint class for conferences
 *
 * Invite users to a conference: POST /conferences
 * Remove users from a conference: DELETE /conferences/{id}
 */
@Path("conferences")
public class ConferenceResource {

    /**
     * Create a new conference which in this case means to invite users to a room.
     * Multiple calls to this service for the same room would just invite more
     * users to the room. Expects a JSON Conference object in body.
     */
    @POST
    @Consumes("application/json")
    @Produces("application/json")
    public Response createConference(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
                                     Conference conference) throws InvalidCredentialsException {
        AuthContext auth = AuthContext.createFromHeader(authHeader);
        Entity caller = VidyoService.INSTANCE.getEntityByUsername(auth, auth.getUsername());

        // Get entity objects for caller and participants, and check status of each prior to starting call
        if (conference.getId().equals("myroom")) {
            conference.setId(caller.getEntityID());
        }

        // Get current participants so we can skip inviting them
        List<Entity> currentParticipants = VidyoService.INSTANCE.getParticipants(auth, conference.getId());

        List<Entity> participants = new ArrayList<Entity>();
        for (User u : conference.getParticipants()) {
            Entity participant = VidyoService.INSTANCE.getEntityByEmail(auth, u.getEmail());

            if (participant != null) {
                if (listContainsEntity(currentParticipants, participant)) {
                    continue; // don't add this entity
                }

                if (!VidyoService.STATUS_ONLINE.equals(participant.getMemberStatus())) {
                    ErrorInfo err = new ErrorInfo();
                    err.setCode(ErrorInfo.CODE_PARTICIPANT_OFFLINE);
                    err.setMessage("Could not start call because " + participant.getDisplayName() + " is offline.");
                    return Response.serverError().entity(err).build();
                }
                participants.add(participant);
            }
            else {
                // Not finding a user is translated to a fatal error, since client specifically wants to invite this user
                ErrorInfo err = new ErrorInfo();
                err.setCode(ErrorInfo.CODE_UNKNOWN_USER);
                err.setMessage("Could not find user with email " + u.getEmail());
                return Response.serverError().entity(err).build();
            }
        }
        // Invite all to caller's personal room
        String extensions = "";
        for (Entity e : participants) {
            VidyoService.INSTANCE.inviteToRoom(auth, conference.getId(), e.getEntityID());
            extensions += e.getExtension() + ",";
        }

        CallRecordService.writeRecord(conference.getId(), caller.getDisplayName(), caller.getExtension(),
                participants.size(), extensions);
        return Response.noContent().build();
    }

    /**
     * Remove all participants from a room conference.
     * For example, DELETE /conferences/myroom
     */
    @DELETE @Path("{id}")
    public Response cancelConference(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
                                     @PathParam("id") String roomId) throws InvalidCredentialsException {
        AuthContext auth = AuthContext.createFromHeader(authHeader);

        // Get entity objects for caller and participants, and check status of each prior to starting call
        if (roomId.equals("myroom")) {
            Entity caller = VidyoService.INSTANCE.getEntityByUsername(auth, auth.getUsername());
            roomId = caller.getEntityID();
        }

        // Kick out all participants from the room
        List<Entity> participants = VidyoService.INSTANCE.getParticipants(auth, roomId);
        for( Entity e : participants) {
            VidyoService.INSTANCE.removeParticipant(auth, roomId, e.getEntityID());
        }

        return Response.noContent().build();
    }

    private boolean listContainsEntity(List<Entity> list, Entity entity) {
        for (Entity e : list) {
            if (e.getEntityID().equals(entity.getEntityID())) {
                return true;
            }
        }
        return false;
    }
}

/*
 Copyright 2012 Jive Software
 
 Licensed under the Apache License, Version 2.0 (the "License");
 You may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */