
package com.vidyo.admin;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementRef;
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
 *         &lt;element name="total" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="recorderID" type="{http://www.w3.org/2001/XMLSchema}int" minOccurs="0"/>
 *         &lt;element name="recorderName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="paused" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="webcast" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element ref="{http://portal.vidyo.com/admin/v1_1}Entity" maxOccurs="unbounded" minOccurs="0"/>
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
    "total",
    "recorderID",
    "recorderName",
    "paused",
    "webcast",
    "entity"
})
@XmlRootElement(name = "GetParticipantsResponse")
public class GetParticipantsResponse {

    protected int total;
    @XmlElementRef(name = "recorderID", namespace = "http://portal.vidyo.com/admin/v1_1", type = JAXBElement.class)
    protected JAXBElement<Integer> recorderID;
    @XmlElementRef(name = "recorderName", namespace = "http://portal.vidyo.com/admin/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> recorderName;
    @XmlElementRef(name = "paused", namespace = "http://portal.vidyo.com/admin/v1_1", type = JAXBElement.class)
    protected JAXBElement<Boolean> paused;
    @XmlElementRef(name = "webcast", namespace = "http://portal.vidyo.com/admin/v1_1", type = JAXBElement.class)
    protected JAXBElement<Boolean> webcast;
    @XmlElement(name = "Entity")
    protected List<Entity> entity;

    /**
     * Gets the value of the total property.
     * 
     */
    public int getTotal() {
        return total;
    }

    /**
     * Sets the value of the total property.
     * 
     */
    public void setTotal(int value) {
        this.total = value;
    }

    /**
     * Gets the value of the recorderID property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link Integer }{@code >}
     *     
     */
    public JAXBElement<Integer> getRecorderID() {
        return recorderID;
    }

    /**
     * Sets the value of the recorderID property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link Integer }{@code >}
     *     
     */
    public void setRecorderID(JAXBElement<Integer> value) {
        this.recorderID = ((JAXBElement<Integer> ) value);
    }

    /**
     * Gets the value of the recorderName property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getRecorderName() {
        return recorderName;
    }

    /**
     * Sets the value of the recorderName property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setRecorderName(JAXBElement<String> value) {
        this.recorderName = ((JAXBElement<String> ) value);
    }

    /**
     * Gets the value of the paused property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public JAXBElement<Boolean> getPaused() {
        return paused;
    }

    /**
     * Sets the value of the paused property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public void setPaused(JAXBElement<Boolean> value) {
        this.paused = ((JAXBElement<Boolean> ) value);
    }

    /**
     * Gets the value of the webcast property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public JAXBElement<Boolean> getWebcast() {
        return webcast;
    }

    /**
     * Sets the value of the webcast property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public void setWebcast(JAXBElement<Boolean> value) {
        this.webcast = ((JAXBElement<Boolean> ) value);
    }

    /**
     * Gets the value of the entity property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the entity property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getEntity().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Entity }
     * 
     * 
     */
    public List<Entity> getEntity() {
        if (entity == null) {
            entity = new ArrayList<Entity>();
        }
        return this.entity;
    }

}
