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
package com.jivesoftware.rest.quotes.entity;

import com.jivesoftware.rest.quotes.model.User;
import com.jivesoftware.rest.quotes.model.impl.UserImpl;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * <p>User representation for quotes system.</p>
 */
@XmlRootElement(name = "user")
public class UserEntity {

    public UserEntity() {
        this.user = new UserImpl();
    }

    public UserEntity(User user) {
        this.user = user;
    }

    private User user;

    public long getID() {
        return user.getID();
    }

    public void setID(long id) {
        user.setID(id);
    }

    public String getFirstName() {
        return user.getFirstName();
    }

    public void setFirstName(String firstName) {
        user.setFirstName(firstName);
    }

    public String getLastName() {
        return user.getLastName();
    }

    public void setLastName(String lastName) {
        user.setLastName(lastName);
    }

    public String getUsername() {
        return user.getUsername();
    }

    public void setUsername(String username) {
        user.setUsername(username);
    }

}
