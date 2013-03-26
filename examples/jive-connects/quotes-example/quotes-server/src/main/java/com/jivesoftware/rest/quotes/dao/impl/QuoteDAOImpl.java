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
import com.jivesoftware.rest.quotes.dao.QuoteDAO;
import com.jivesoftware.rest.quotes.model.Customer;
import com.jivesoftware.rest.quotes.model.Quote;
import com.jivesoftware.rest.quotes.model.impl.QuoteImpl;
import org.springframework.beans.factory.annotation.Required;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * <p>Quote DAO implementation for quotes system.</p>
 */
public class QuoteDAOImpl implements QuoteDAO {

    @Override
    public synchronized void delete(Quote quote) throws IllegalArgumentException {
        Quote previous = quotes.get(quote.getID());
        if (previous == null) {
            throw new IllegalArgumentException("Missing quote " + quote.getID());
        }
        quotes.remove(quote.getID());
    }

    @Override
    public synchronized List<Quote> find() {
        List<Quote> results = new ArrayList<Quote>();
        for (Quote quote : quotes.values()) {
            results.add(quote);
        }
        return results;
    }

    @Override
    public List<Quote> find(long customerID) {
        List<Quote> results = new ArrayList<Quote>();
        for (Quote quote : quotes.values()) {
            if (customerID == quote.getCustomerID()) {
                results.add(quote);
            }
        }
        return results;
    }

    @Override
    public List<Quote> find(long customerID, String status) {
        List<Quote> results = new ArrayList<Quote>();
        for (Quote quote : quotes.values()) {
            if ((customerID == quote.getCustomerID() && status.equals(quote.getStatus()))) {
                results.add(quote);
            }
        }
        return results;
    }

    @Override
    public List<Quote> find(String status) {
        List<Quote> results = new ArrayList<Quote>();
        for (Quote quote : quotes.values()) {
            if (status.equals(quote.getStatus())) {
                results.add(quote);
            }
        }
        return results;
    }

    @Override
    public synchronized Quote get(long quoteID) {
        return quotes.get(quoteID);
    }

    public void init() {
        reset();
    }

    @Override
    public synchronized void insert(Quote quote) throws IllegalArgumentException {
        long highest = highest();
        quote.setID(highest + 1);
        quotes.put(quote.getID(), quote);
    }

    private static final long MS_PER_DAY = (24 * 60 * 60 * 1000);
    private static final String[] QUOTE_NUMBERS = {
            "MN-3676-XL57",
            "HL-5599-HL00",
            "EW-7631-HC72",
            "UH-1067-QP69",
            "FN-1348-AV93",
            "DL-5976-ZK36",
            "SN-4906-HL42",
            "FC-6351-GG82",
            "EJ-6881-UY70",
            "SZ-8904-GQ64",
            "QO-1898-RV04",
            "CX-7886-SZ09",
            "EE-9771-PQ92",
            "VH-3910-TB64",
            "MX-0600-MT10",
            "CC-0933-WO35",
            "WM-2333-AL35",
            "PX-4694-QJ74",
            "GD-1164-MZ75",
    };

    @Override
    public synchronized void reset() {
        customerDAO.reset();
        quotes.clear();
        long today = (new Date()).getTime();
        for (int i = 0; i < QUOTE_NUMBERS.length; i++) {
            Customer customer = null;
            while (customer == null) {
                int customerIndex = random.nextInt(CustomerDAOImpl.RESET_CUSTOMER_COUNT);
                customer = customerDAO.get(customerIndex);
            }
            long daysOffset = random.nextInt(15);
            long dueDate = today + (daysOffset * MS_PER_DAY);
            int priceOffset = random.nextInt(50000);
            priceOffset -= (priceOffset % 100);
            long totalPrice = 75000L + priceOffset;
            Quote quote = new QuoteImpl(-1L, customer.getID(), null, dueDate,
                                        QUOTE_NUMBERS[i], customer.getAccountUserID(),
                                        "pending", "Quotation '" + QUOTE_NUMBERS[i] + "'",
                                        new BigDecimal(totalPrice));
            insert(quote);
        }

    }

    @Override
    public synchronized void update(Quote quote) throws IllegalArgumentException {
        Quote previous = quotes.get(quote.getID());
        if (previous == null) {
            throw new IllegalArgumentException("Missing quote " + quote.getID());
        }
        quotes.put(quote.getID(), quote);
    }

    private long highest() {
        long highest = 0L;
        for (Long key : quotes.keySet()) {
            long value = key.longValue();
            if (value > highest) {
                highest = value;
            }
        }
        return highest;
    }

    private Random random = new Random();
    private Map<Long,Quote> quotes = new HashMap<Long,Quote>();

    // ----------------------------------------------------------------------------------------------------- Injectables

    private CustomerDAO customerDAO;

    @Required
    public void setCustomerDAO(CustomerDAO customerDAO) {
        this.customerDAO = customerDAO;
    }

}
