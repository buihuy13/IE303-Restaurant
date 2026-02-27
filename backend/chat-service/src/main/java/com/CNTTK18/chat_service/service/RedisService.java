package com.CNTTK18.chat_service.service;

public interface RedisService {
    public void setValue(String key, String value);

    public String getValue(String key);

    public void deleteValue(String key);

    public Boolean exists(String key);
}
