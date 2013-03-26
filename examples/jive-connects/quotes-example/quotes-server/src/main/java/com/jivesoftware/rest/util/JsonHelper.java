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
package com.jivesoftware.rest.util;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;

/**
 * <p>Helper class for dealing with JSON objects.</p>
 */
public class JsonHelper {

    private JsonHelper() {}

    public static boolean equivalent(JSONObject first, JSONObject second) {
        if (first.length() != second.length()) {
            return false; // Number of keys differs, so cannot be equivalent
        }
        // assert("only need to iterate over one set of keys because duplicate keys are not allowed");
        Iterator keys = first.keys();
        while (keys.hasNext()) {
            String key = (String) keys.next();
            if (!second.has(key)) {
                return false; // Missing a required key
            }
            try {
                Object firstValue = first.opt(key);
                Object secondValue = second.opt(key);
                if (!equivalent(firstValue, secondValue)) {
                    return false;
                }
            } catch (JSONException e) {
                throw new IllegalArgumentException(e);
            }
        }
        return true;
    }


    // Compare two field values.  This is pretty strict about types, i.e. "123" and 123 are not considered equal
    private static boolean equivalent(Object first, Object second) throws JSONException {
        if (first == null) {
            return second == null;
        }
        if (second == null) {
            return first == null;
        }
        if (JSONObject.NULL.equals(first)) {
            return JSONObject.NULL.equals(second);
        }
        if (JSONObject.NULL.equals(second)) {
            return JSONObject.NULL.equals(first);
        }
        // assert("both values are not null and not equal to JSONObject.NULL");
        if (first instanceof Boolean) {
            if (!(second instanceof Boolean)) {
                return false; // type mismatch
            }
            else if (!first.equals(second)) {
                return false; // value mismatch
            }
        }
        else if (first instanceof JSONArray) {
            if (!(second instanceof JSONArray)) {
                return false; // type mismatch
            }
            JSONArray firstArray = (JSONArray) first;
            JSONArray secondArray = (JSONArray) second;
            if (firstArray.length() != secondArray.length()) {
                return false; // length mismatch
            }
            for (int i = 0; i < firstArray.length(); i++) {
                Object firstValue = firstArray.get(i);
                Object secondValue = secondArray.get(i);
                if (!equivalent(firstValue, secondValue)) {
                    return false; // value mismatch
                }
            }
        }
        else if (first instanceof JSONObject) {
            if (!(second instanceof JSONObject)) {
                return false; // type mismatch
            }
            else if (!equivalent((JSONObject) first, (JSONObject) second)) {
                return false; // value mismatch
            }
        }
        else if (first instanceof Number) {
            if (!(second instanceof Number)) {
                return false; // type mismatch
            }
            else if (!first.equals(second)) {
                return false; // value mismatch
            }
        }
        else if (first instanceof String) {
            if (!(second instanceof String)) {
                return false; // type mismatch
            }
            else if (!first.equals(second)) {
                return false; // value mismatch
            }
        }
        else {
            throw new IllegalArgumentException("JSONObject field value of type " + first.getClass().getName());
        }
        return true;
    }

    private static boolean contains(String key, String[] keys) {
        for (int i = 0; i < keys.length; i++) {
            if (key.equals(keys[i])) {
                return true;
            }
        }
        return false;
    }

}
