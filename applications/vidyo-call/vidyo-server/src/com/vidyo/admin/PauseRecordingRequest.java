
package com.vidyo.admin;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for anonymous complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType>
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="conferenceID" type="{http://portal.vidyo.com/admin/v1_1}EntityID"/>
 *         &lt;element name="recorderID" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "conferenceID",
    "recorderID"
})
@XmlRootElement(name = "PauseRecordingRequest")
public class PauseRecordingRequest {

    protected int conferenceID;
    protected int recorderID;

    /**
     * Gets the value of the conferenceID property.
     * 
     */
    public int getConferenceID() {
        return conferenceID;
    }

    /**
     * Sets the value of the conferenceID property.
     * 
     */
    public void setConferenceID(int value) {
        this.conferenceID = value;
    }

    /**
     * Gets the value of the recorderID property.
     * 
     */
    public int getRecorderID() {
        return recorderID;
    }

    /**
     * Sets the value of the recorderID property.
     * 
     */
    public void setRecorderID(int value) {
        this.recorderID = value;
    }

}
