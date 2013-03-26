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

import com.jivesoftware.rest.quotes.dao.LineDAO;
import com.jivesoftware.rest.quotes.model.Line;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>Quote line DAO implementation for quotes system.</p>
 */
public class LineDAOImpl implements LineDAO {

    @Override
    public synchronized void delete(Line line) throws IllegalArgumentException {
        Line previous = lines.get(line.getID());
        if (previous == null) {
            throw new IllegalArgumentException("Missing line " + line.getID());
        }
        lines.remove(line.getID());
    }

    @Override
    public List<Line> find(long quoteID) {
        List<Line> results = new ArrayList<Line>();
        for (Line line : lines.values()) {
            if (quoteID == line.getQuoteID()) {
                results.add(line);
            }
        }
        sort(results);
        return results;
    }

    @Override
    public synchronized Line get(long lineID) {
        return lines.get(lineID);
    }

    public void init() {
        reset();
    }

    @Override
    public synchronized void insert(Line line) throws IllegalArgumentException {
        long highest = highest();
        line.setID(highest + 1);
        lines.put(line.getID(), line);
    }

    @Override
    public synchronized void reset() {
        lines.clear();
        // TODO - reset() populate initial data
    }

    @Override
    public synchronized void update(Line line) throws IllegalArgumentException {
        Line previous = lines.get(line.getID());
        if (previous == null) {
            throw new IllegalArgumentException("Missing line " + line.getID());
        }
        lines.put(line.getID(), line);
    }

    private long highest() {
        long highest = 0L;
        for (Long key : lines.keySet()) {
            long value = key.longValue();
            if (value > highest) {
                highest = value;
            }
        }
        return highest;
    }

    private void sort(List<Line> lines) {
        Comparator<Line> comparator = new LineComparator();
        Collections.sort(lines, comparator);
    }

    private Map<Long,Line> lines = new HashMap<Long,Line>();

    public static class LineComparator implements Comparator<Line> {
        @Override
        public int compare(Line line1, Line line2) {
            if (line1.getLineNumber() < line2.getLineNumber()) {
                return -1;
            }
            else if (line1.getLineNumber() > line2.getLineNumber()) {
                return 1;
            }
            else {
                return 0;
            }
        }
    }

}
