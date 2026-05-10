# Event-Based Image Upload - Best Practice Implementation Plan

## Overview Analysis

### Problems with Previous Approach
1. **Unnecessary Complexity**: Adding async/events for a simple upload that needs immediate result
2. **Eventual Consistency**: Product/Restaurant created without image, then updated later → poor UX
3. **Pending State Tracking**: Extra table and complexity to track incomplete uploads
4. **Race Conditions**: Client might fetch product before image event arrives
5. **Error Recovery Complexity**: Multiple failure points across distributed systems

### When to Use Event-Driven vs Synchronous

| Scenario | Recommended Approach |
|----------|---------------------|
| Image is **required** for entity creation | **Synchronous** (current) |
| Image is **optional**/can be added later | **Event-Driven** with compensating transactions |
| High upload frequency, performance critical | **Event-Driven** with async processing |
| User expects immediate feedback | **Synchronous** |
| Background processing (thumbnails, compression) | **Event-Driven** |

**Recommendation**: For this use case (restaurant/product images), **keep synchronous** but add events for **secondary processing** only.

---

## Best Practice: Hybrid Approach

### Architecture

```
┌─────────────┐                    ┌─────────────────┐
│  Frontend   │ ───1. Upload──────>│   Restaurant    │
│   (User)    │<──4. Response──────│    Service      │
└─────────────┘                    └────────┬────────┘
                                             │
                     ┌───────────────────────┴──────────────────────┐
                     │ 2. Synchronous Call (wait for result)        │
                     ▼                                               │
              ┌─────────────┐                                       │
              │  Image      │ ───3. Upload to Cloudinary─────────────┼──┐
              │  Service    │                                       │  │
              └──────┬──────┘                                       │  │
                     │                                              │  │
                     │ 4. Return {public_id, url}                   │  │
                     │<─────────────────────────────────────────────┘  │
                     │                                                 │
                     │ 5. Publish Event (async, fire-and-forget)      │
                     ▼                                                 │
              ┌─────────────┐                                         │
              │   RabbitMQ  │ ───6. Consumed by other services────────┘
              │             │     - notification-service (new item alert)
              └─────────────┘     - recommendation-service (update ML model)
                                   - analytics-service (track uploads)
```

### Key Principles

1. **Primary Path**: Synchronous - Restaurant Service waits for Image Service response
2. **Secondary Effects**: Asynchronous events for:
   - Notifications
   - Analytics
   - Cache invalidation
   - Search indexing
   - ML model updates

3. **Error Handling**: Direct exceptions, no DLQ needed for primary flow

---

## Implementation Plan

### Phase 1: Keep Synchronous Primary Flow ✅ Already Done

**Current implementation is correct for main flow:**

```java
// Restaurant Service
public ProductResponse createProduct(..., MultipartFile imageFile, ...) {
    // 1. Save product first
    Products product = buildProduct(productRequest, restaurant);
    Products savedProduct = productRepo.save(product);

    // 2. Upload image SYNCHRONOUSLY
    if (imageFile != null && !imageFile.isEmpty()) {
        var image = imageServiceClient.uploadImage(imageFile, "product");
        savedProduct.setImageURL(image.get("url"));
        savedProduct.setPublicID(image.get("public_id"));
        savedProduct = productRepo.save(savedProduct);
    }

    return productMapper.toProductResponse(savedProduct);
}
```

**Why this is better:**
- Atomic: Product saved with image or fails completely
- Immediate: Response includes image URL
- Simple: No pending states, no event consumption complexity
- Consistent: No race conditions

---

### Phase 2: Add Events for Secondary Operations

#### Use Cases for Events (NOT for updating database):

1. **Notification Service**: New product added → notify followers
2. **Recommendation Service**: New item → update recommendation model
3. **Analytics Service**: Track upload metrics
4. **Search Service**: Index new product/restaurant
5. **Cache Invalidation**: Clear related caches

#### Event Flow

```
Image Service
    │
    ├─> Upload to Cloudinary (synchronous, return to caller)
    │
    └─> After successful upload → Publish "ImageUploaded" event
            │
            ├─> notification-service: Send "New Item Added" notification
            ├─> recommendation-service: Update user preferences
            ├─> analytics-service: Record metric
            └─> search-service: Index entity
```

---

## Files to Create/Modify

### 1. Common Module Events

#### `Common/src/main/java/com/CNTTK18/Common/event/ImageUploadedEvent.java`
```java
package com.CNTTK18.Common.event;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadedEvent {
    private String eventType; // IMAGE_UPLOADED
    private String entityType; // PRODUCT, RESTAURANT, USER_AVATAR, etc.
    private UUID entityId;
    private UUID restaurantId; // For products
    private UUID merchantId;   // For restaurants
    private String imageUrl;
    private String publicId;
    private String folder;
    private LocalDateTime timestamp;
}
```

### 2. RabbitMQ Configuration (Common)

#### `Common/src/main/java/com/CNTTK18/Common/config/RabbitMQConfig.java`
```java
package com.CNTTK18.Common.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Exchange;
import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchange
    public static final String IMAGE_EVENTS_EXCHANGE = "image.events.exchange";

    // Queues
    public static final String IMAGE_UPLOADED_QUEUE = "image.uploaded.queue";
    public static final String NOTIFICATION_QUEUE = "notification.image.queue";
    public static final String ANALYTICS_QUEUE = "analytics.image.queue";

    // Routing Keys
    public static final String IMAGE_UPLOADED_RK = "image.uploaded";

    @Bean
    public Exchange imageEventsExchange() {
        return ExchangeBuilder.topicExchange(IMAGE_EVENTS_EXCHANGE)
                .durable(true)
                .build();
    }

    @Bean
    public Queue imageUploadedQueue() {
        return QueueBuilder.durable(IMAGE_UPLOADED_QUEUE).build();
    }

    @Bean
    public Queue notificationImageQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE).build();
    }

    @Bean
    public Queue analyticsImageQueue() {
        return QueueBuilder.durable(ANALYTICS_QUEUE).build();
    }

    @Bean
    public Binding imageUploadedBinding() {
        return BindingBuilder.bind(imageUploadedQueue())
                .to(imageEventsExchange())
                .with(IMAGE_UPLOADED_RK);
    }

    @Bean
    public Binding notificationImageBinding() {
        return BindingBuilder.bind(notificationImageQueue())
                .to(imageEventsExchange())
                .with(IMAGE_UPLOADED_RK);
    }

    @Bean
    public Binding analyticsImageBinding() {
        return BindingBuilder.bind(analyticsImageQueue())
                .to(imageEventsExchange())
                .with(IMAGE_UPLOADED_RK);
    }
}
```

### 3. Image Service - Publisher

#### `image-service/build.gradle.kts`
```kotlin
dependencies {
    // ... existing ...
    implementation("org.springframework.boot:spring-boot-starter-amqp")
}
```

#### `image-service/src/main/java/com/CNTTK18/image_service/config/RabbitMQConfig.java`
```java
package com.CNTTK18.image_service.config;

import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public MessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonConverter());
        return template;
    }
}
```

#### `image-service/src/main/java/com/CNTTK18/image_service/service/impl/ImageServiceImpl.java`
```java
package com.CNTTK18.image_service.service.impl;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.Common.config.RabbitMQConfig;
import com.CNTTK18.Common.event.ImageUploadedEvent;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {

    private final Cloudinary cloudinary;
    private final RabbitTemplate rabbitTemplate;

    @Override
    public Map<String, String> uploadImage(
            MultipartFile file,
            String folder,
            String entityType,
            UUID entityId,
            UUID restaurantId,
            UUID merchantId) {

        try {
            // 1. Upload to Cloudinary
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", folder != null ? folder : "restaurant_app"
            );
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), uploadParams);

            Map<String, String> response = new HashMap<>();
            response.put("public_id", (String) result.get("public_id"));
            response.put("url", (String) result.get("secure_url"));

            // 2. Publish event for secondary processing (fire-and-forget)
            publishImageUploadedEvent(entityType, entityId, restaurantId, merchantId,
                    response.get("public_id"), response.get("url"), folder);

            // 3. Return result synchronously
            return response;

        } catch (IOException ex) {
            log.error("Failed to upload image: {}", ex.getMessage());
            throw new RuntimeException("Failed to upload image", ex);
        }
    }

    private void publishImageUploadedEvent(
            String entityType,
            UUID entityId,
            UUID restaurantId,
            UUID merchantId,
            String publicId,
            String url,
            String folder) {

        try {
            ImageUploadedEvent event = ImageUploadedEvent.builder()
                    .eventType("IMAGE_UPLOADED")
                    .entityType(entityType)
                    .entityId(entityId)
                    .restaurantId(restaurantId)
                    .merchantId(merchantId)
                    .imageUrl(url)
                    .publicId(publicId)
                    .folder(folder)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.IMAGE_EVENTS_EXCHANGE,
                    RabbitMQConfig.IMAGE_UPLOADED_RK,
                    event
            );

            log.info("Published ImageUploadedEvent for {} {}", entityType, entityId);

        } catch (Exception e) {
            // Don't fail the upload if event publishing fails
            log.error("Failed to publish ImageUploadedEvent: {}", e.getMessage());
        }
    }

    @Override
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image", e);
        }
    }
}
```

#### `image-service/src/main/java/com/CNTTK18/image_service/controller/ImageController.java`
```java
@PostMapping("/upload")
public ResponseEntity<Map<String, String>> uploadImage(
        @RequestPart(value = "file", required = true) MultipartFile file,
        @RequestParam(value = "folder", required = false) String folder,
        @RequestParam(value = "entityType", required = false) String entityType,
        @RequestParam(value = "entityId", required = false) UUID entityId,
        @RequestParam(value = "restaurantId", required = false) UUID restaurantId,
        @RequestParam(value = "merchantId", required = false) UUID merchantId) {

    validateImageFile(file);
    return new ResponseEntity<>(
            imageService.uploadImage(file, folder, entityType, entityId, restaurantId, merchantId),
            HttpStatusCode.valueOf(201)
    );
}
```

### 4. Notification Service - Consumer (Example)

#### `notification-service/src/main/java/com/CNTTK18/notification_service/listener/ImageEventListener.java`
```java
package com.CNTTK18.notification_service.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.config.RabbitMQConfig;
import com.CNTTK18.Common.event.ImageUploadedEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImageEventListener {

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleImageUploaded(ImageUploadedEvent event) {
        try {
            log.info("Received ImageUploadedEvent: {}", event);

            // Only process product images for notifications
            if ("PRODUCT".equals(event.getEntityType())) {
                // Send notification to restaurant followers
                sendNewProductNotification(event);
            }

        } catch (Exception e) {
            log.error("Error processing ImageUploadedEvent: {}", e.getMessage(), e);
            // Don't rethrow - we don't want to block the queue
        }
    }

    private void sendNewProductNotification(ImageUploadedEvent event) {
        // Implementation: send push/web/socket notifications
        log.info("Sending new product notification for restaurant: {}", event.getRestaurantId());
    }
}
```

### 5. Restaurant Service - Update Client Call

#### `restaurant-service/src/main/java/com/CNTTK18/restaurant_service/service/impl/ProductServiceImpl.java`
```java
private void setImageIfPresent(Products product, MultipartFile imageFile) {
    if (imageFile == null || imageFile.isEmpty()) return;

    // Include metadata for event publishing
    var image = imageServiceClient.uploadImage(
            imageFile,
            "product",
            "PRODUCT",
            product.getId(),
            product.getRestaurant().getId(),
            product.getRestaurant().getMerchantId()
    );

    product.setImageURL(image.get("url"));
    product.setPublicID(image.get("public_id"));
}
```

### 6. Docker Compose Addition

```yaml
rabbitmq:
  image: rabbitmq:3-management
  container_name: rabbitmq
  ports:
    - "5672:5672"
    - "15672:15672"
  environment:
    RABBITMQ_DEFAULT_USER: guest
    RABBITMQ_DEFAULT_PASS: guest
  healthcheck:
    test: ["CMD", "rabbitmq-diagnostics", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
  volumes:
    - rabbitmq_data:/var/lib/rabbitmq
```

### 7. Application Configuration

#### `image-service/src/main/resources/application.yml`
```yaml
spring:
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USER:guest}
    password: ${RABBITMQ_PASS:guest}
    publisher-confirm-type: simple
    publisher-returns: true
```

#### `notification-service/src/main/resources/application.yml`
```yaml
spring:
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABMQ_USER:guest}
    password: ${RABBITMQ_PASS:guest}
    listener:
      simple:
        acknowledge-mode: auto
        retry:
          enabled: true
          max-attempts: 3
```

---

## Error Handling Strategy

### Primary Path (Synchronous)
- Cloudinary fails → Exception propagated to Restaurant Service → Transaction rolled back → Error returned to user
- Network timeout → Circuit breaker in ImageServiceClient → Fallback error response

### Secondary Path (Async Events)
- Event publish fails → Log error, continue (non-blocking)
- Event consumer fails → Log error, don't rethrow (best effort)
- No DLQ needed for these fire-and-forget events

### Why No DLQ?
- Events are for **secondary** operations (notifications, analytics)
- Missing notification ≠ data corruption
- If critical: add DLQ and monitoring

---

## Files Summary

### New Files to Create:
| File | Purpose |
|------|---------|
| `Common/.../event/ImageUploadedEvent.java` | Event DTO |
| `Common/.../config/RabbitMQConfig.java` | RabbitMQ exchange/queue config |
| `image-service/.../config/RabbitMQConfig.java` | RabbitTemplate config |
| `notification-service/.../listener/ImageEventListener.java` | Example consumer |

### Files to Modify:
| File | Changes |
|------|---------|
| `image-service/build.gradle.kts` | Add AMQP dependency |
| `image-service/.../ImageServiceImpl.java` | Add event publishing |
| `image-service/.../ImageController.java` | Add metadata params |
| `restaurant-service/.../ProductServiceImpl.java` | Pass metadata to image client |
| `notification-service/build.gradle.kts` | Add AMQP dependency |
| `docker-compose.yml` | Add RabbitMQ |

---

## Implementation Steps

1. **Setup Common Module**
   - Create ImageUploadedEvent
   - Create RabbitMQConfig

2. **Setup Image Service Publisher**
   - Add dependencies
   - Configure RabbitTemplate
   - Update ImageServiceImpl to publish events

3. **Create Consumer (Notification Service)**
   - Add dependencies
   - Create listener
   - Test event consumption

4. **Update Restaurant Service**
   - Update client calls to pass metadata

5. **Add RabbitMQ to Docker Compose**
   - Start infrastructure
   - Test end-to-end

---

## Verification

1. **Test Synchronous Flow**:
   ```bash
   # Upload product image
   curl -X POST http://localhost:8080/api/products \
     -F "file=@image.jpg" \
     -F "restaurantId=..." \
     -F "name=Test Product"

   # Verify response includes image URL
   ```

2. **Test Event Publishing**:
   ```bash
   # Check RabbitMQ management UI
   # http://localhost:15672
   # Verify queue: image.uploaded.queue
   ```

3. **Test Event Consumption**:
   ```bash
   # Check notification-service logs
   # Should see: "Received ImageUploadedEvent"
   ```

---

## Summary

This hybrid approach:
- ✅ Keeps the primary flow **synchronous** (simple, consistent, immediate)
- ✅ Uses events for **secondary operations** (notifications, analytics)
- ✅ Avoids complexity of pending states and eventual consistency
- ✅ Easier to debug and maintain
- ✅ Better user experience (immediate feedback)
