
package com.vidyo.admin;

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
 *         &lt;element name="webCastURL" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="hasWebCastPIN" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
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
    "webCastURL",
    "hasWebCastPIN"
})
@XmlRootElement(name = "GetWebcastURLResponse")
public class GetWebcastURLResponse {

    @XmlElementRef(name = "webCastURL", namespace = "http://portal.vidyo.com/admin/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> webCastURL;
    protected Boolean hasWebCastPIN;

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

}
