
package com.vidyo.user;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
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
 *         &lt;element name="roomURL" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="isLocked" type="{http://www.w3.org/2001/XMLSchema}boolean"/>
 *         &lt;element name="hasPIN" type="{http://www.w3.org/2001/XMLSchema}boolean"/>
 *         &lt;element name="roomPIN" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="webCastURL" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="hasWebCastPIN" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="webCastPIN" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="hasModeratorPIN" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="moderatorPIN" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
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
    "roomURL",
    "isLocked",
    "hasPIN",
    "roomPIN",
    "webCastURL",
    "hasWebCastPIN",
    "webCastPIN",
    "hasModeratorPIN",
    "moderatorPIN"
})
@XmlRootElement(name = "RoomMode")
public class RoomMode {

    @XmlElementRef(name = "roomURL", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> roomURL;
    protected boolean isLocked;
    protected boolean hasPIN;
    @XmlElementRef(name = "roomPIN", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> roomPIN;
    @XmlElementRef(name = "webCastURL", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> webCastURL;
    protected Boolean hasWebCastPIN;
    @XmlElementRef(name = "webCastPIN", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> webCastPIN;
    @XmlElementRef(name = "hasModeratorPIN", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<Boolean> hasModeratorPIN;
    @XmlElementRef(name = "moderatorPIN", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> moderatorPIN;

    /**
     * Gets the value of the roomURL property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getRoomURL() {
        return roomURL;
    }

    /**
     * Sets the value of the roomURL property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setRoomURL(JAXBElement<String> value) {
        this.roomURL = ((JAXBElement<String> ) value);
    }

    /**
     * Gets the value of the isLocked property.
     * 
     */
    public boolean isIsLocked() {
        return isLocked;
    }

    /**
     * Sets the value of the isLocked property.
     * 
     */
    public void setIsLocked(boolean value) {
        this.isLocked = value;
    }

    /**
     * Gets the value of the hasPIN property.
     * 
     */
    public boolean isHasPIN() {
        return hasPIN;
    }

    /**
     * Sets the value of the hasPIN property.
     * 
     */
    public void setHasPIN(boolean value) {
        this.hasPIN = value;
    }

    /**
     * Gets the value of the roomPIN property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getRoomPIN() {
        return roomPIN;
    }

    /**
     * Sets the value of the roomPIN property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setRoomPIN(JAXBElement<String> value) {
        this.roomPIN = ((JAXBElement<String> ) value);
    }

    /**
     * Gets the value of the webCastURL property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getWebCastURL() {
        return webCastURL;
    }

    /**
     * Sets the value of the webCastURL property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setWebCastURL(JAXBElement<String> value) {
        this.webCastURL = ((JAXBElement<String> ) value);
    }

    /**
     * Gets the value of the hasWebCastPIN property.
     * 
     * @return
     *     possible object is
     *     {@link Boolean }
     *     
     */
    public Boolean isHasWebCastPIN() {
        return hasWebCastPIN;
    }

    /**
     * Sets the value of the hasWebCastPIN property.
     * 
     * @param value
     *     allowed object is
     *     {@link Boolean }
     *     
     */
    public void setHasWebCastPIN(Boolean value) {
        this.hasWebCastPIN = value;
    }

    /**
     * Gets the value of the webCastPIN property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getWebCastPIN() {
        return webCastPIN;
    }

    /**
     * Sets the value of the webCastPIN property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setWebCastPIN(JAXBElement<String> value) {
        this.webCastPIN = ((JAXBElement<String> ) value);
    }

    /**
     * Gets the value of the hasModeratorPIN property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public JAXBElement<Boolean> getHasModeratorPIN() {
        return hasModeratorPIN;
    }

    /**
     * Sets the value of the hasModeratorPIN property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public void setHasModeratorPIN(JAXBElement<Boolean> value) {
        this.hasModeratorPIN = ((JAXBElement<Boolean> ) value);
    }

    /**
     * Gets the value of the moderatorPIN property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getModeratorPIN() {
        return moderatorPIN;
    }

    /**
     * Sets the value of the moderatorPIN property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setModeratorPIN(JAXBElement<String> value) {
        this.moderatorPIN = ((JAXBElement<String> ) value);
    }

}
