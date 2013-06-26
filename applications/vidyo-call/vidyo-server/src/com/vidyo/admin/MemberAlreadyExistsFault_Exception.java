
package com.vidyo.admin;

import javax.xml.ws.WebFault;


/**
 * This class was generated by the JAX-WS RI.
 * JAX-WS RI 2.1.6 in JDK 6
 * Generated source version: 2.1
 * 
 */
@WebFault(name = "MemberAlreadyExistsFault", targetNamespace = "http://portal.vidyo.com/admin/v1_1")
public class MemberAlreadyExistsFault_Exception
    extends Exception
{

    /**
     * Java type that goes as soapenv:Fault detail element.
     * 
     */
    private MemberAlreadyExistsFault faultInfo;

    /**
     * 
     * @param message
     * @param faultInfo
     */
    public MemberAlreadyExistsFault_Exception(String message, MemberAlreadyExistsFault faultInfo) {
        super(message);
        this.faultInfo = faultInfo;
    }

    /**
     * 
     * @param message
     * @param faultInfo
     * @param cause
     */
    public MemberAlreadyExistsFault_Exception(String message, MemberAlreadyExistsFault faultInfo, Throwable cause) {
        super(message, cause);
        this.faultInfo = faultInfo;
    }

    /**
     * 
     * @return
     *     returns fault bean: com.vidyo.admin.MemberAlreadyExistsFault
     */
    public MemberAlreadyExistsFault getFaultInfo() {
        return faultInfo;
    }

}