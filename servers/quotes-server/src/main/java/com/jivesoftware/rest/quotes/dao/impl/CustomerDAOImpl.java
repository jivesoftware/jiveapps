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
package com.jivesoftware.rest.quotes.dao.impl;

import com.jivesoftware.rest.quotes.dao.CustomerDAO;
import com.jivesoftware.rest.quotes.dao.UserDAO;
import com.jivesoftware.rest.quotes.model.Customer;
import com.jivesoftware.rest.quotes.model.impl.CustomerImpl;
import com.jivesoftware.rest.quotes.model.User;
import org.springframework.beans.factory.annotation.Required;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * <p>Customer DAO implementation for quotes system.</p>
 */
public class CustomerDAOImpl implements CustomerDAO {

    @Override
    public synchronized void delete(Customer customer) throws IllegalArgumentException {
        Customer previous = customers.get(customer.getID());
        if (previous == null) {
            throw new IllegalArgumentException("Missing customer " + customer.getID());
        }
        customers.remove(customer.getID());
    }

    @Override
    public synchronized List<Customer> find() {
        List<Customer> results = new ArrayList<Customer>();
        for (Customer customer : customers.values()) {
            results.add(customer);
        }
        return results;
    }

    @Override
    public synchronized Customer get(long customerID) {
        return customers.get(customerID);
    }

    public void init() {
        reset();
    }

    @Override
    public synchronized void insert(Customer customer) throws IllegalArgumentException {
        long highest = highest();
        customer.setID(highest + 1);
        customers.put(customer.getID(), customer);
    }

    static final int RESET_CUSTOMER_COUNT = 15; // Set to number of customers we will initialize below

    @Override
    public synchronized void reset() {
        userDAO.reset();
        User user1 = userDAO.find("sales1");
        User user2 = userDAO.find("sales2");
        customers.clear();
        Customer customer;
        customer = new CustomerImpl(-1, "0001-0001", user1.getID(), "Wal-Mart Stores");         insert(customer);
        customer = new CustomerImpl(-1, "0002-0002", user2.getID(), "Exxon Mobil");             insert(customer);
        customer = new CustomerImpl(-1, "0003-0003", user1.getID(), "Chevron");                 insert(customer);
        customer = new CustomerImpl(-1, "0004-0004", user2.getID(), "General Electric");        insert(customer);
        customer = new CustomerImpl(-1, "0005-0005", user1.getID(), "Bank of America Corp.");   insert(customer);
        customer = new CustomerImpl(-1, "0006-0006", user2.getID(), "ConocoPhillips");          insert(customer);
        customer = new CustomerImpl(-1, "0007-0007", user1.getID(), "AT&T");                    insert(customer);
        customer = new CustomerImpl(-1, "0008-0008", user2.getID(), "Ford Motor");              insert(customer);
        customer = new CustomerImpl(-1, "0009-0009", user1.getID(), "J.P. Morgan Chase & Co."); insert(customer);
        customer = new CustomerImpl(-1, "0010-0010", user2.getID(), "Hewlett Packard");         insert(customer);
        customer = new CustomerImpl(-1, "0011-0011", user1.getID(), "Berkshire Hathaway");      insert(customer);
        customer = new CustomerImpl(-1, "0012-0012", user2.getID(), "Citigroup");               insert(customer);
        customer = new CustomerImpl(-1, "0013-0013", user1.getID(), "Verizon Communications");  insert(customer);
        customer = new CustomerImpl(-1, "0014-0014", user2.getID(), "McKesson");                insert(customer);
        customer = new CustomerImpl(-1, "0015-0015", user1.getID(), "General Motors");          insert(customer);
    }

    @Override
    public synchronized void update(Customer customer) throws IllegalArgumentException {
        Customer previous = customers.get(customer.getID());
        if (previous == null) {
            throw new IllegalArgumentException("Missing customer " + customer.getID());
        }
        customers.put(customer.getID(), customer);
    }

    private long highest() {
        long highest = 0;
        for (Long key : customers.keySet()) {
            long value = key.longValue();
            if (value > highest) {
                highest = value;
            }
        }
        return highest;
    }

    private Map<Long,Customer> customers = new HashMap<Long,Customer>();

    // ----------------------------------------------------------------------------------------------------- Injectables

    private UserDAO userDAO;

    @Required
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

}
