// 面试问题和答案数据
export const categories = [
    { id: 'redis', name: 'Redis' },
    { id: 'spring', name: 'Spring' },
    { id: 'java-dev', name: 'Java开发' },
    { id: 'java-basic', name: 'Java基础' },
    { id: 'mysql', name: 'MySQL' },
    { id: 'mybatis', name: 'MyBatis' },
    { id: 'mq', name: 'MQ' },
    { id: 'comprehensive', name: '综合' },
    { id: 'design-pattern', name: '设计模式' }
]

// 面试问题数据
export const interviewQuestions = {
    'redis': [
        {
            id: 'redis-1',
            question: 'Redis的数据类型有哪些？',
            answer: 'Redis支持五种数据类型：\n1. 字符串（String）：最基本的数据类型，可以存储字符串、整数或浮点数。\n2. 列表（List）：按照插入顺序排序的字符串元素集合。\n3. 集合（Set）：无序且唯一的字符串元素集合。\n4. 有序集合（Sorted Set）：类似集合，但每个元素关联一个分数，用于排序。\n5. 哈希表（Hash）：键值对的无序集合，适合存储对象。\n\n此外，Redis还支持Bitmap、HyperLogLog、Geo等特殊数据类型。'
        },
        {
            id: 'redis-2',
            question: 'Redis持久化机制有哪些？',
            answer: 'Redis提供了两种持久化机制：\n\n1. RDB（Redis Database）：\n- 通过创建快照（snapshot）来获取数据库在某个时间点的副本\n- 优点：适合备份，恢复速度快\n- 缺点：可能会丢失最后一次快照后的数据\n\n2. AOF（Append Only File）：\n- 记录服务器接收的每个写操作\n- 优点：数据安全性高，丢失数据少\n- 缺点：文件体积大，恢复速度慢\n\n可以同时使用两种持久化机制，Redis重启时会优先使用AOF恢复数据。'
        },
        {
            id: 'redis-3',
            question: 'Redis如何实现分布式锁？',
            answer: 'Redis实现分布式锁的基本步骤：\n\n1. 获取锁：使用SETNX命令（SET if Not eXists）\n```\nSETNX lock_key unique_value PX 30000\n```\n- lock_key：锁的名称\n- unique_value：唯一标识（通常是客户端ID）\n- PX 30000：设置30秒过期时间\n\n2. 释放锁：使用Lua脚本确保原子性\n```lua\nif redis.call("get", KEYS[1]) == ARGV[1] then\n    return redis.call("del", KEYS[1])\nelse\n    return 0\nend\n```\n\n注意事项：\n- 锁必须设置过期时间，防止死锁\n- 释放锁时必须验证持有者，防止误释放\n- 考虑使用Redisson等成熟的实现'
        }
    ],
    'spring': [
        {
            id: 'spring-1',
            question: 'Spring框架的核心模块有哪些？',
            answer: 'Spring框架的核心模块包括：\n\n1. Spring Core：提供IoC容器，管理bean的创建和依赖注入\n2. Spring AOP：面向切面编程实现，提供拦截机制\n3. Spring MVC：Web应用程序开发框架，实现MVC设计模式\n4. Spring ORM：对象关系映射支持，集成Hibernate、JPA等\n5. Spring JDBC：简化JDBC操作的模块\n6. Spring Transaction：提供事务管理功能\n7. Spring Security：安全框架，提供认证和授权功能\n8. Spring Boot：简化Spring应用配置和部署\n9. Spring Cloud：分布式系统解决方案\n\n这些模块可以根据需要单独使用，也可以组合使用。'
        },
        {
            id: 'spring-2',
            question: 'Spring IoC和DI是什么？',
            answer: 'IoC（Inversion of Control，控制反转）和DI（Dependency Injection，依赖注入）是Spring框架的核心概念：\n\n1. IoC：\n- 控制反转是一种设计原则，将对象的创建、管理和装配的控制权从应用代码转移到外部容器\n- 应用程序不再负责对象的创建和维护，而是由IoC容器负责\n- 这种方式降低了组件之间的耦合度\n\n2. DI：\n- 依赖注入是IoC的一种实现方式\n- 对象不再自己创建依赖对象，而是由容器在运行时将依赖注入到对象中\n- Spring支持三种主要的依赖注入方式：\n  * 构造器注入：通过构造函数参数注入依赖\n  * Setter注入：通过setter方法注入依赖\n  * 字段注入：直接注入到类的字段（使用@Autowired注解）\n\n通过IoC和DI，Spring实现了松耦合、可测试性强的应用程序架构。'
        }
    ],
    'java-dev': [
        {
            id: 'java-dev-1',
            question: 'Java中的多线程实现方式有哪些？',
            answer: 'Java中实现多线程的方式主要有以下几种：\n\n1. 继承Thread类：\n```java\npublic class MyThread extends Thread {\n    @Override\n    public void run() {\n        // 线程执行代码\n    }\n}\n// 使用\nMyThread t = new MyThread();\nt.start();\n```\n\n2. 实现Runnable接口：\n```java\npublic class MyRunnable implements Runnable {\n    @Override\n    public void run() {\n        // 线程执行代码\n    }\n}\n// 使用\nThread t = new Thread(new MyRunnable());\nt.start();\n```\n\n3. 实现Callable接口（可以有返回值）：\n```java\npublic class MyCallable implements Callable<String> {\n    @Override\n    public String call() throws Exception {\n        // 线程执行代码\n        return "结果";\n    }\n}\n// 使用\nFutureTask<String> task = new FutureTask<>(new MyCallable());\nThread t = new Thread(task);\nt.start();\nString result = task.get(); // 获取返回值\n```\n\n4. 使用线程池：\n```java\nExecutorService executor = Executors.newFixedThreadPool(10);\nexecutor.execute(new MyRunnable());\nFuture<String> future = executor.submit(new MyCallable());\n```\n\n5. Lambda表达式（Java 8+）：\n```java\nThread t = new Thread(() -> {\n    // 线程执行代码\n});\nt.start();\n```\n\n推荐使用实现Runnable或Callable接口的方式，因为它们更灵活，可以继承其他类。线程池则适合管理大量线程的场景。'
        }
    ],
    'java-basic': [
        {
            id: 'java-basic-1',
            question: 'Java中的基本数据类型有哪些？',
            answer: 'Java中有8种基本数据类型：\n\n1. 整数类型：\n   - byte：8位，范围-128~127\n   - short：16位，范围-32,768~32,767\n   - int：32位，范围-2^31~2^31-1\n   - long：64位，范围-2^63~2^63-1\n\n2. 浮点类型：\n   - float：32位，单精度浮点数\n   - double：64位，双精度浮点数\n\n3. 字符类型：\n   - char：16位，表示一个Unicode字符\n\n4. 布尔类型：\n   - boolean：表示true或false\n\n这些基本类型都有对应的包装类：Byte, Short, Integer, Long, Float, Double, Character, Boolean。包装类将基本数据类型封装成对象，可以调用方法，也可以为null。'
        },
        {
            id: 'java-basic-2',
            question: 'Java中的String、StringBuilder和StringBuffer有什么区别？',
            answer: 'String、StringBuilder和StringBuffer的主要区别：\n\n1. String：\n   - 不可变类，一旦创建不能修改\n   - 每次修改都会创建新的String对象\n   - 线程安全\n   - 适合少量字符串操作的场景\n\n2. StringBuilder：\n   - 可变类，可以修改内容\n   - 非线程安全\n   - 性能较好，适合单线程下大量字符串操作\n   - Java 5引入\n\n3. StringBuffer：\n   - 可变类，可以修改内容\n   - 线程安全（方法使用synchronized修饰）\n   - 性能比StringBuilder稍差，但在多线程环境下安全\n   - Java 1.0就有\n\n性能比较：StringBuilder > StringBuffer > String\n\n使用建议：\n- 如果字符串不会改变，使用String\n- 单线程环境下频繁修改字符串，使用StringBuilder\n- 多线程环境下频繁修改字符串，使用StringBuffer'
        }
    ],
    'mysql': [
        {
            id: 'mysql-1',
            question: 'MySQL的存储引擎有哪些？它们有什么区别？',
            answer: 'MySQL主要的存储引擎及其区别：\n\n1. InnoDB（默认）：\n   - 支持事务（ACID）\n   - 支持行级锁\n   - 支持外键约束\n   - 支持崩溃恢复\n   - 使用聚集索引（数据和索引存储在一起）\n   - 适合高并发、事务处理场景\n\n2. MyISAM：\n   - 不支持事务\n   - 表级锁定\n   - 不支持外键\n   - 全文索引支持\n   - 较高的插入和查询速度\n   - 适合读多写少的场景\n\n3. MEMORY（HEAP）：\n   - 数据存储在内存中\n   - 表级锁定\n   - 不支持BLOB和TEXT字段\n   - 速度极快\n   - 适合临时表和缓存\n\n4. ARCHIVE：\n   - 高度压缩\n   - 只支持INSERT和SELECT操作\n   - 不支持索引\n   - 适合日志和数据归档\n\n5. NDB（集群）：\n   - 分布式存储引擎\n   - 高可用性\n   - 适合需要高可用性的场景\n\n选择存储引擎的考虑因素：\n- 是否需要事务支持\n- 并发性要求\n- 是否需要外键\n- 数据量大小和增长速度\n- 查询和写入比例'
        }
    ],
    'mybatis': [
        {
            id: 'mybatis-1',
            question: 'MyBatis中#{}和${}的区别是什么？',
            answer: 'MyBatis中#{}和${}的主要区别：\n\n1. #{}：\n   - 预编译处理，会将参数转换成?，然后使用PreparedStatement的set方法赋值\n   - 可以防止SQL注入攻击\n   - 自动进行类型转换\n   - 例如：SELECT * FROM user WHERE id = #{id}\n   - 实际执行：SELECT * FROM user WHERE id = ?\n\n2. ${}：\n   - 字符串替换，直接将参数值替换到SQL语句中\n   - 不能防止SQL注入\n   - 不进行类型转换\n   - 例如：SELECT * FROM user WHERE id = ${id}\n   - 实际执行：SELECT * FROM user WHERE id = 1\n\n使用建议：\n- 一般情况下优先使用#{}，更安全\n- 当需要动态指定表名、列名等SQL结构时，只能使用${}\n- 使用${}时要特别注意SQL注入风险，确保参数来源可信或已经过滤'
        }
    ],
    'mq': [
        {
            id: 'mq-1',
            question: '消息队列的作用和应用场景有哪些？',
            answer: '消息队列（MQ）的作用和应用场景：\n\n主要作用：\n1. 异步处理：非核心流程异步化，提高系统响应速度\n2. 应用解耦：系统间通过消息队列通信，降低系统耦合度\n3. 流量削峰：缓冲突发流量，保护系统稳定性\n4. 消息分发：一对多的消息分发，实现发布/订阅模式\n\n常见应用场景：\n1. 电商下单：用户下单后，订单系统将消息发送到MQ，库存系统、物流系统、积分系统等异步消费处理\n2. 注册流程：用户注册后，发送验证邮件、短信等非核心流程通过MQ异步处理\n3. 日志处理：系统日志通过MQ异步写入存储系统\n4. 秒杀系统：请求先入队列，后台系统按照处理能力消费，避免系统崩溃\n5. 数据同步：不同系统间的数据同步\n\n常见的消息队列产品：\n- Kafka：高吞吐量，适合日志收集和流处理\n- RabbitMQ：功能全面，易于使用和部署\n- RocketMQ：阿里开源，支持海量消息堆积\n- ActiveMQ：老牌MQ，功能丰富\n- Pulsar：新一代分布式消息系统，兼容Kafka和RabbitMQ'
        }
    ],
    'comprehensive': [
        {
            id: 'comprehensive-1',
            question: '分布式系统的CAP理论是什么？',
            answer: 'CAP理论是分布式系统设计中的基本定理，由Eric Brewer在2000年提出：\n\nCAP代表三个特性：\n1. 一致性（Consistency）：所有节点在同一时间看到的数据是一致的\n2. 可用性（Availability）：服务一直可用，每个请求都能得到响应\n3. 分区容错性（Partition tolerance）：系统在网络分区的情况下仍然能够继续运行\n\nCAP理论指出，在分布式系统中，这三个特性最多只能同时满足两个，不可能同时满足三个。\n\n常见的选择：\n- CP系统：保证一致性和分区容错性，但可能牺牲可用性。例如：HBase、ZooKeeper、Redis Cluster\n- AP系统：保证可用性和分区容错性，但可能牺牲一致性。例如：Cassandra、DynamoDB、Eureka\n- CA系统：保证一致性和可用性，但在发生分区时无法正常工作。例如：传统关系型数据库（MySQL、Oracle）\n\n在实际应用中，P（分区容错性）通常是必须的，因为网络分区是不可避免的。因此，实际的选择往往是在C和A之间权衡。现代分布式系统通常会采用最终一致性等折中方案，在保证基本可用性的同时，尽可能提供数据一致性。'
        }
    ],
    'design-pattern': [
        {
            id: 'design-pattern-1',
            question: '单例模式的实现方式有哪些？',
            answer: '单例模式的主要实现方式：\n\n1. 饿汉式（静态常量）：\n```java\npublic class Singleton {\n    private static final Singleton instance = new Singleton();\n    \n    private Singleton() {}\n    \n    public static Singleton getInstance() {\n        return instance;\n    }\n}\n```\n优点：线程安全，简单\n缺点：类加载时就初始化，可能造成资源浪费\n\n2. 懒汉式（线程不安全）：\n```java\npublic class Singleton {\n    private static Singleton instance;\n    \n    private Singleton() {}\n    \n    public static Singleton getInstance() {\n        if (instance == null) {\n            instance = new Singleton();\n        }\n        return instance;\n    }\n}\n```\n优点：延迟加载\n缺点：线程不安全\n\n3. 懒汉式（线程安全，同步方法）：\n```java\npublic class Singleton {\n    private static Singleton instance;\n    \n    private Singleton() {}\n    \n    public static synchronized Singleton getInstance() {\n        if (instance == null) {\n            instance = new Singleton();\n        }\n        return instance;\n    }\n}\n```\n优点：线程安全，延迟加载\n缺点：每次获取实例都要同步，效率低\n\n4. 双重检查锁（DCL）：\n```java\npublic class Singleton {\n    private static volatile Singleton instance;\n    \n    private Singleton() {}\n    \n    public static Singleton getInstance() {\n        if (instance == null) {\n            synchronized (Singleton.class) {\n                if (instance == null) {\n                    instance = new Singleton();\n                }\n            }\n        }\n        return instance;\n    }\n}\n```\n优点：线程安全，延迟加载，效率较高\n缺点：实现复杂，需要volatile关键字\n\n5. 静态内部类：\n```java\npublic class Singleton {\n    private Singleton() {}\n    \n    private static class SingletonHolder {\n        private static final Singleton INSTANCE = new Singleton();\n    }\n    \n    public static Singleton getInstance() {\n        return SingletonHolder.INSTANCE;\n    }\n}\n```\n优点：线程安全，延迟加载，效率高\n缺点：无法传参\n\n6. 枚举：\n```java\npublic enum Singleton {\n    INSTANCE;\n    \n    public void method() {\n        // 方法实现\n    }\n}\n```\n优点：最简洁，自动线程安全，防止反射和序列化问题\n缺点：无延迟加载\n\n推荐使用静态内部类或枚举实现单例模式。'
        }
    ]
} 