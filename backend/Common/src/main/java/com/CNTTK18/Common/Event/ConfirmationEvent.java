package com.CNTTK18.Common.Event;

public class ConfirmationEvent {
    private String email;
    private String url;

    public ConfirmationEvent() {}

    public ConfirmationEvent(String email, String url) {
        this.email = email;
        this.url = url;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
