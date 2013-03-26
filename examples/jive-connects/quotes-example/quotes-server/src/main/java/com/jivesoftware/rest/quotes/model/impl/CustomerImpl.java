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
package com.jivesoftware.rest.quotes.model.impl;

import com.jivesoftware.rest.quotes.model.Customer;

/**
 * <p>Customer model implementation for quotes system.</p>
 */
public class CustomerImpl implements Customer {

    public CustomerImpl() {}

    public CustomerImpl(long id, String accountNumber, long accountUserID, String name) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.accountUserID = accountUserID;
        this.name = name;
    }

    private long id = -1L;
    private String accountNumber;
    private long accountUserID;
    private String name;

    public long getID() {
        return id;
    }

    public void setID(long id) {
        this.id = id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public long getAccountUserID() {
        return accountUserID;
    }

    public void setAccountUserID(long accountUserID) {
        this.accountUserID = accountUserID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
