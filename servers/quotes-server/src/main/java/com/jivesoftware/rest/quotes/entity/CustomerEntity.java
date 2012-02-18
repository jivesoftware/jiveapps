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

import com.jivesoftware.rest.quotes.model.Customer;
import com.jivesoftware.rest.quotes.model.impl.CustomerImpl;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * <p>Customer representation for the quotes system.</p>
 */
@XmlRootElement(name = "customer")
public class CustomerEntity {

    public CustomerEntity() {
        this.customer = new CustomerImpl();
    }

    public CustomerEntity(Customer customer) {
        this.customer = customer;
    }

    private UserEntity accountUser;
    private Customer customer;

    public long getID() {
        return customer.getID();
    }

    public void setID(long id) {
        customer.setID(id);
    }

    public String getAccountNumber() {
        return customer.getAccountNumber();
    }

    public void setAccountNumber(String accountNumber) {
        customer.setAccountNumber(accountNumber);
    }

    public UserEntity getAccountUser() {
        return this.accountUser;
    }

    public void setAccountUser(UserEntity accountUser) {
        this.accountUser = accountUser;
    }

    public String getName() {
        return customer.getName();
    }

    public void setName(String name) {
        customer.setName(name);
    }

}
