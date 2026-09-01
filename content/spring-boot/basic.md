# Spring Boot - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is Spring Boot and how does it differ from plain Spring?
* Opinionated framework removing Spring's configuration burden: auto-configuration, starter dependencies, embedded servers (Tomcat/Jetty), production features (Actuator).
* Plain Spring requires explicit XML/Java config for every bean; Boot infers from classpath ("found H2 + JPA → configure datasource").
* Result: `java -jar app.jar` runnable microservice in minutes vs days of wiring.

---

### Q2: What is auto-configuration and how do you debug or disable it?
* Boot inspects classpath, beans, properties at startup; `@EnableAutoConfiguration` loads conditionally-defined configurations (`@ConditionalOnClass`, `@ConditionalOnMissingBean`).
* Debug with `--debug` flag printing the CONDITIONS EVALUATION REPORT (matched/not-matched).
* Exclude via `@SpringBootApplication(exclude=DataSourceAutoConfiguration.class)` or property.
Your bean ALWAYS wins over auto-config (`@ConditionalOnMissingBean` backs off) - the key extension principle.

---

### Q3: What are starters?
* Curated dependency descriptors: `spring-boot-starter-web` pulls Spring MVC+Jackson+Tomcat coherently versioned.
* Kill transitive-dependency guesswork; Boot's BOM manages compatible versions across the ecosystem.
* Common set to name: web, data-jpa, security, validation, actuator, test, data-redis.

---

### Q4: Walk through @SpringBootApplication annotations.
Composite of three:
1. `@Configuration` - class is a bean-definition source.
2. `@ComponentScan` - pick up `@Component/@Service/@Repository/@Controller` under package (root scan covers sub-packages - why main class sits at root).
3. `@EnableAutoConfiguration` - activates conditional config machinery.

---

### Q5: What is the IoC container / ApplicationContext?
* Inversion of Control: the framework creates and wires objects (beans) instead of classes instantiating their own dependencies.
* ApplicationContext is the advanced container - lifecycle callbacks, events, i18n, resource loading on top of bean factory.
* Beans defined via stereotype annotations, `@Bean` methods, or imports; retrieved by type mostly - coding to interfaces becomes natural.

---

### Q6: Compare constructor vs setter vs field injection.
* **Constructor injection (recommended)**: required deps explicit, immutable fields, test-friendly (new Service(mock)), fails fast at startup if missing.
* Setter: optional re-configurable deps.
* Field (@Autowired on field): terse but hides dependencies, complicates testing, forbidden in many style guides.
Interview line: "constructor injection makes illegal states unrepresentable."

---

### Q7: What scopes can beans have?
* singleton (default - one per container), prototype (new each request), request/session/application/websocket (web contexts).
* Gotchas: injecting prototype into singleton needs `@Lookup`, ObjectProvider, or scoped proxy; stateful singletons are concurrency hazards.
Know `@RequestScope` for per-request data carriers like tenant context holders.

---

### Q8: What is application.properties/yml and how does profile-based config work?
* Externalized config loaded from classpath/file overrides; relaxed binding maps `server.port` ↔ serverPort.
* Profiles (`application-prod.yml`) activated via `spring.profiles.active`; profile-specific beans via `@Profile`.
* Precedence ladder worth reciting: CLI args > env vars > profile file > application.yml > defaults.

---

### Q9: What is the Actuator? Name key endpoints.
* Production ops surface: `/actuator/health` (liveness/readiness groups), `/metrics` (Micrometer), `/env`, `/beans`, `/mappings`, `/threaddump`, `/loggers` (runtime level changes!).
* Secure exposure discipline: health/info public; rest internal-only.
* Custom HealthIndicators integrate downstream checks; MetricsEndpoint feeds Prometheus scrape configs.

---

### Q10: How do you connect to a database using Spring Data JPA?
```py
spring.datasource.url=jdbc:postgresql://...
spring.jpa.hibernate.ddl-auto=validate
```
* Starter data-jpa + driver; define entity + `interface BookRepo extends JpaRepository<Book,Long>` - CRUD implemented at runtime.
* `ddl-auto=validate` in prod (Flyway owns schema); derived queries (`findByAuthorName`) from method names.

### Q11: What is an Entity and what rules govern it?
* `@Entity` class mapped to table via JPA; requires @Id; default no-arg constructor.
* `@Table(name=...)`, `@Column` mappings; identity generation `GenerationType.IDENTITY/SEQUENCE` (SEQUENCE + pooled optimizer better for batching).
* Entities managed by persistence context - detached copies behave differently than managed ones (a classic confusion).

---

### Q12: Explain repositories: CrudRepository vs JpaRepository vs derived queries.
* JpaRepository extends Crud/PagingAndSorting adding flush/persistence ops & batching.
* Derived queries: `List<Book> findByTitleContainingIgnoreCase(String q);` - parsed into JPQL.
* Custom JPQL via `@Query`; pagination params Pageable returning Page<T>.

---

### Q13: What is Spring MVC's request handling flow?
1. DispatcherServlet receives → HandlerMapping finds controller method.
2. ArgumentResolvers populate parameters (@PathVariable/@RequestBody...).
3. Controller executes → ReturnValueHandler serializes (Jackson) → response.
4. Exceptions funnel through HandlerExceptionResolver chain (@ExceptionHandler/@ControllerAdvice).
Knowing resolvers/advice hooks explains most "why isn't my exception mapped" mysteries.

---

### Q14: What are @Controller vs @RestController vs @Service?
* @Controller returns view names; @ResponseBody on methods returns JSON instead - @RestController composes both.
* @Service marks business layer (semantic only, same as @Component technically).
* Layering discipline: controller→service→repository; controllers never touch repositories directly in disciplined codebases.

---

### Q15: How do you validate request bodies?
```java
record CreateUser(@NotBlank String name, @Email String email) {}
@PostMapping @Valid create(@RequestBody CreateUser req)
```
* Jakarta Validation annotations trigger via Hibernate Validator when starter-validation present.
* Method-level `@Validated` enables constraint checks on plain params.
Failures throw MethodArgumentNotValidException → handled globally via advice returning field-error map.

---

### Q16: What is the role of application events (@EventListener)?
* In-process pub/sub: publisher emits POJO event via ApplicationEventPublisher; listeners react asynchronously (`@Async`) or synchronously.
* Uses: decouple side effects (email after registration) from core flow.
Caveat: same-transaction by default - pair with `@TransactionalEventListener(phase=AFTER_COMMIT)` for post-commit semantics.

---

### Q17: How do you schedule tasks?
* `@EnableScheduling` + `@Scheduled(cron="0 0 * * * *", fixedDelay=...)`.
* Single-threaded scheduler default - long tasks delay others; configure pool size or use Quartz/shedlock for clusters.
Cluster note: @Scheduled runs on EVERY node → shedlock/JDBC lock needed for once-per-cluster semantics.

---

### Q18: What does @Transactional do and where can it go?
* Declares transactional boundary around method/class; default rollback on RuntimeException/Error only - checked exceptions need rollbackFor.
* Placement rule: services layer (not controllers/repositories); self-invocation bypasses proxy - a top-3 interview trap.

---

### Q19: What is Spring Security's basic architecture?
* Filter chain (DelegatingFilterProxy → FilterChainProxy → SecurityFilters): authentication filters → authorization check at end.
* Modern lambda DSL:
```java
http.authorizeHttpRequests(a -> a.requestMatchers("/api/**").authenticated())
    .oauth2ResourceServer(o -> o.jwt());
```
* SecurityContext holds Authentication; accessed via SecurityContextHolder.

---

### Q20: What is DevTools and what does it change in dev?
* Auto-restart on classpath changes (faster than cold boot), live template/cache defaults disabled, H2 console enabled.
* Disabled automatically in packaged jars - dev-only safety net.
LiveReload integration pairs with static resources for instant browser refresh.

---

### Q21: What is the difference between `@RequestParam` and `@PathVariable`?
* `@PathVariable` extracts values directly from the URI path template (`/users/{id}` → `@PathVariable("id") Long id`). Used for identifying resources hierarchically.
* `@RequestParam` extracts query parameters from the query string (`/users?status=active` → `@RequestParam("status") String status`) or form fields. Used for filtering, sorting, or pagination.

---

### Q22: What is `@RequestBody` and how does it deserialize payloads?
* `@RequestBody` tells Spring MVC to deserialize the inbound HTTP request body into a Java object.
* It delegates to registered `HttpMessageConverter` instances (primarily `MappingJackson2HttpMessageConverter` for JSON `application/json`).
* It automatically triggers validation if paired with `@Valid` or `@Validated`.

---

### Q23: How does global exception handling work with `@ControllerAdvice` and `@ExceptionHandler`?
* `@RestControllerAdvice` (or `@ControllerAdvice`) allows writing centralized, cross-cutting exception interception across all `@RequestMapping` methods.
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }
}
```
* Prevents leaking raw stack traces or internal container 500 error pages.

---

### Q24: What is Spring Boot Actuator and what are its core endpoints?
* `spring-boot-starter-actuator` provides production-ready operational monitoring and management features.
* Core endpoints:
  - `/actuator/health`: Liveness and readiness probes for container orchestrators (Kubernetes).
  - `/actuator/metrics`: Micrometer-backed metrics (JVM memory, CPU, request latency).
  - `/actuator/info`: Arbitrary application metadata and git commit information.
  - `/actuator/env`: Active configuration properties.

---

### Q25: How do you configure and secure Spring Boot Actuator in production?
* By default, only `/health` is exposed over web for security.
* In `application.properties`:
```properties
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when_authorized
```
* Secure sensitive actuator endpoints behind Spring Security with specific roles (`hasRole('ACTUATOR_ADMIN')`).

---

### Q26: What is the Spring IoC Container and ApplicationContext?
* The Inversion of Control (IoC) container instantiates, configures, wires, and manages the lifecycle of beans.
* `BeanFactory` is the root container interface providing basic dependency injection.
* `ApplicationContext` is the advanced, enterprise-grade superset extending `BeanFactory` with event publication, message internationalization (i18n), resource loading, and environment abstraction.

---

### Q27: What are the different Spring Bean Scopes?
* **Singleton** (default): One shared instance per Spring IoC container.
* **Prototype**: A new bean instance created every time it is requested/injected.
* **Request** (Web): One instance per single HTTP request lifecycle.
* **Session** (Web): One instance per HTTP session.
* **Application** (Web): One instance per `ServletContext`.
* **Websocket**: One instance per WebSocket lifecycle.

---

### Q28: What is `@ConfigurationProperties` and how does it differ from `@Value`?
* `@ConfigurationProperties` binds external hierarchical configuration keys (`app.security.token-timeout`) to strongly-typed POJOs/records with validation, relaxed binding, and IDE autocompletion.
* `@Value("${app.token.timeout}")` evaluates flat SpEL expressions and property keys inline on individual fields without type safety or validation guarantees.

---

### Q29: What is the role of `CommandLineRunner` and `ApplicationRunner`?
* Interfaces used to execute initialization code once the `ApplicationContext` is fully refreshed and right before `SpringApplication.run()` completes.
* `CommandLineRunner` receives raw `String... args`.
* `ApplicationRunner` receives typed `ApplicationArguments` with helper methods for parsed options (`--key=value`).

---

### Q30: How does Spring Data JPA create repository implementations automatically?
* When you declare an interface extending `JpaRepository<T, ID>`, Spring Data uses dynamic byte-code generation (JDK dynamic proxies) at startup to implement the interface.
* Query methods (e.g. `findByEmailAndStatus(String email, Status s)`) are parsed using predefined keywords (`find...By`, `OrderBy`, `Between`) and compiled into JPQL queries automatically.

---

### Q31: What is the N+1 query problem in Spring Data JPA and how do you resolve it?
* Occurs when fetching an entity with lazy relationships triggers 1 query for the parent plus N separate queries for each child.
* Solutions:
  1. `JOIN FETCH` in custom JPQL (`@Query("SELECT u FROM User u JOIN FETCH u.roles")`).
  2. `@EntityGraph(attributePaths = {"roles"})` on repository methods.
  3. Batch fetching (`@BatchSize` or `hibernate.default_batch_fetch_size`).

---

### Q32: What is the purpose of `@Repository` annotation?
* Specialization of `@Component` that marks a Data Access Object (DAO).
* Crucially enables Spring's `PersistenceExceptionTranslationPostProcessor`, which intercepts native database/JPA exceptions (e.g. `SQLException`, `HibernateException`) and translates them into Spring's unified `DataAccessException` hierarchy.

---

### Q33: What is the difference between `application.properties` and `application.yml`?
* `properties`: Flat key-value format (`spring.datasource.url=...`).
* `yaml` / `yml`: Indentation-based hierarchical format, supports list structures and clean grouping without repeating namespace prefixes.
* Functionally equivalent in Spring Boot, but YAML cannot be loaded via `@PropertySource`.

---

### Q34: What are Spring Profiles and how do you activate them?
* Profiles segregate configuration for different environments (e.g. `dev`, `staging`, `prod`).
* Files named `application-dev.yml` or `application-prod.yml` activate based on `spring.profiles.active=dev` (or JVM arg `-Dspring.profiles.active=prod`).
* Beans can be conditioned using `@Profile("dev")`.

---

### Q35: How do you configure Cross-Origin Resource Sharing (CORS) in Spring Boot?
* Method/Controller level: `@CrossOrigin(origins = "https://example.com")`.
* Global configuration via `WebMvcConfigurer`:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://example.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

---

### Q36: What is the `@Async` annotation and how is it enabled?
* Marks a method to be executed asynchronously on a separate worker thread from a task executor pool.
* Enabled by placing `@EnableAsync` on a `@Configuration` class.
* Methods should return `void`, `Future<T>`, or `CompletableFuture<T>`. Must be invoked from an external bean to pass through the Spring proxy.

---

### Q37: How does Spring Boot manage database migrations with Flyway or Liquibase?
* Adding `flyway-core` or `liquibase-core` starter automatically triggers migrations at startup before the `EntityManagerFactory` initializes.
* Flyway looks for SQL scripts in `classpath:db/migration` following the versioning format `V1__init.sql`, `V2__add_users.sql`, and records execution in `flyway_schema_history`.

---

### Q38: What is `RestTemplate` vs `WebClient` vs `RestClient`?
* `RestTemplate`: Synchronous, blocking HTTP client (in maintenance mode since Spring 5).
* `WebClient`: Non-blocking, reactive HTTP client from `spring-boot-starter-webflux` (supports both synchronous and streaming operations).
* `RestClient`: Modern synchronous HTTP client introduced in Spring Boot 3.1 / Spring 6 offering a fluent, functional API over `RestTemplate`.

---

### Q39: What is Spring Boot's layered architecture convention?
* **Presentation Layer**: `@RestController` handles HTTP requests, headers, and validation.
* **Service Layer**: `@Service` encapsulates business logic and transactional boundaries.
* **Data Access Layer**: `@Repository` / `JpaRepository` interfaces for persistence.
* **Domain / Entity Layer**: Data models and JPA entities.

---

### Q40: What is `@Lazy` initialization and when should it be used?
* By default, Spring creates singleton beans eagerly at startup. `@Lazy` delays bean instantiation until the bean is first requested or injected.
* Reduces application startup time in large monoliths or dev environments, but delays detection of configuration/wiring errors until runtime.

---

### Q41: How do you configure logging in Spring Boot?
* Spring Boot uses SLF4J with Logback by default.
* Configured in `application.properties`:
```properties
logging.level.root=INFO
logging.level.com.example.athenaeum=DEBUG
logging.pattern.console=%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n
```
* Custom `logback-spring.xml` can be provided in `src/main/resources` for advanced log rolling and multi-profile appenders.

---

### Q42: What is the difference between Filter and HandlerInterceptor in Spring?
* **Filter** (`jakarta.servlet.Filter`): Part of the Servlet container, intercepts requests before and after `DispatcherServlet`. Operates on raw `HttpServletRequest` / `HttpServletResponse`.
* **HandlerInterceptor**: Part of Spring MVC framework, executes around controller handlers (`preHandle`, `postHandle`, `afterCompletion`). Has access to the Spring `HandlerMethod` and `ModelAndView`.

---

### Q43: How do you write slice tests using `@WebMvcTest` and `@DataJpaTest`?
* `@WebMvcTest(UserController.class)`: Boots only the MVC layer (controllers, converters, security); dependencies are mocked using `@MockBean`.
* `@DataJpaTest`: Configures an in-memory database, scans `@Entity` and Spring Data repositories, and rolls back transactions after each test method.

---

### Q44: What is the `@Primary` and `@Qualifier` annotations?
* When multiple beans of the same type exist in the context:
  - `@Primary` gives default preference to one bean candidate during autowiring.
  - `@Qualifier("beanName")` explicitly specifies which bean to inject at the injection point.

---

### Q45: What is Spring Boot 3's requirement regarding Java baseline and Jakarta EE?
* Spring Boot 3.x requires **Java 17** as the minimum baseline (Java 17, 21, etc.).
* Upgraded from Java EE (`javax.*`) to **Jakarta EE 10** (`jakarta.*`), requiring package namespace changes across Servlet, JPA, and Validation APIs (`jakarta.persistence.*`, `jakarta.validation.*`).

---

### Q46: What is GraalVM Native Image support in Spring Boot 3 (AOT)?
* Ahead-Of-Time (AOT) compilation transforms Spring Boot applications into standalone native executables using GraalVM.
* Benefits: Instant startup (milliseconds) and tiny memory footprint.
* Requirement: Requires static analysis of reflection, proxies, and resource loading at build time (`spring-boot-starter-parent` with `native-maven-plugin`).

---

### Q47: What is the purpose of `@ResponseStatus`?
* Customizes the HTTP status code returned when a controller method completes or when a custom exception is thrown without using `ResponseEntity`:
```java
@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "Volume not shelved in codex")
public class CodexNotFoundException extends RuntimeException {}
```

---

### Q48: How do you handle pagination and sorting in Spring Data JPA?
* Pass `Pageable` into repository methods and return a `Page<T>`:
```java
Page<Question> findByStack(String stack, Pageable pageable);
```
* Call using `PageRequest.of(page, size, Sort.by("id").descending())`.
* `Page<T>` contains total elements, total pages, hasNext, and slice content.

---

### Q49: What is `@CrossOrigin` vs Spring Security CORS filter?
* `@CrossOrigin` is handled by Spring MVC and is evaluated only after the request passes through the Spring Security filter chain.
* Pre-flight OPTIONS requests or unauthenticated CORS requests may be blocked by Spring Security before reaching the MVC layer.
* Production systems should configure `http.cors()` inside `SecurityFilterChain` so security filters handle preflight OPTIONS appropriately.

---

### Q50: How do you configure graceful shutdown in Spring Boot?
* Set `server.shutdown=graceful` in `application.properties`.
* When a termination signal (`SIGTERM`) is received, the embedded web server stops accepting new requests and allows active in-flight requests a grace period (`spring.lifecycle.timeout-per-shutdown-phase=30s`) to complete before closing.
