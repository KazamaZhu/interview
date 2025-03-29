// 默认分类列表
export const defaultCategories = [
    'Redis', 'Spring', 'Java开发', 'MySQL', 'MyBatis', 'Spring MVC',
    'Linux', '框架', '多线程', '算法/数据结构', 'HTTP/网络', '前端开发',
    'Docker', 'Spring Boot', '微服务', '设计模式', 'JVM', 'Hibernate'
]

// 默认面试题
export const defaultInterviewQuestions = {
    'Redis': [
        {
            question: "Redis的数据类型有哪些？",
            answer: "Redis支持五种数据类型：\n1. 字符串（String）：可以是字符串、整数或者浮点数\n2. 列表（List）：一个链表，链表上的每个节点都包含了一个字符串\n3. 集合（Set）：包含字符串的无序集合，集合中的元素是唯一的\n4. 哈希表（Hash）：包含键值对的无序散列表\n5. 有序集合（Sorted Set）：类似于集合，但每个元素都关联了一个分数，用于排序"
        },
        {
            question: "Redis持久化机制有哪些？",
            answer: "Redis提供了两种持久化机制：\n1. RDB（Redis Database）：在指定的时间间隔内将内存中的数据集快照写入磁盘。恢复时将快照文件直接读到内存里。\n2. AOF（Append Only File）：记录服务器执行的所有写操作命令，并在服务器启动时，重新执行这些命令来恢复数据。AOF文件比RDB更新频率高，优先级也更高。"
        },
        {
            question: "Redis如何实现分布式锁？",
            answer: "Redis实现分布式锁的基本步骤：\n1. 获取锁：使用SETNX命令设置一个键值对，如果键不存在则设置成功并获取锁\n2. 设置过期时间：使用EXPIRE命令为锁设置一个过期时间，防止客户端崩溃后锁一直无法释放\n3. 释放锁：使用DEL命令删除锁对应的键\n4. 锁续期：使用watchdog机制定期检查并延长锁的过期时间\n\n为了解决更复杂的场景，可以使用Redisson等客户端库，它们提供了更完善的分布式锁实现。"
        }
    ],
    'Spring': [
        {
            question: "Spring框架的核心模块有哪些？",
            answer: "Spring框架的核心模块包括：\n1. Spring Core：提供了框架的基础功能，包含IoC和DI功能\n2. Spring AOP：提供了面向切面编程的实现\n3. Spring MVC：提供了Web应用程序的MVC实现\n4. Spring ORM：提供了对ORM框架的整合支持\n5. Spring DAO：提供了对JDBC的抽象层\n6. Spring Context：提供了框架式的Bean访问方式，以及企业级功能（如JNDI、定时任务等）"
        },
        {
            question: "什么是Spring IOC和DI？",
            answer: "IoC（Inversion of Control，控制反转）是一种设计原则，它将传统上由程序代码直接操控的对象的调用权交给了Spring容器，通过容器来实现对象组件的装配和管理。\n\nDI（Dependency Injection，依赖注入）是IoC的一种实现方式，它是指在Spring容器创建Bean对象时，动态地将其依赖对象注入到Bean中。\n\n两者的关系是：IoC是一种思想，DI是IoC的具体实现方式。Spring通过DI实现了IoC，使得对象的创建和依赖关系的管理从代码中脱离出来，由Spring容器统一管理。"
        }
    ],
    'Java开发': [
        {
            question: "Java中的多态是什么？如何实现？",
            answer: "多态是指同一个行为具有多个不同表现形式的能力。在Java中，多态性允许不同类的对象对同一消息做出响应，即同一方法调用可以有不同的行为。\n\nJava多态的实现主要通过以下方式：\n1. 继承：子类继承父类，并重写父类的方法\n2. 接口：类实现接口，并提供接口方法的具体实现\n3. 方法重写：子类重写父类的方法，使其具有不同的行为\n\n示例代码：\n```java\n// 父类\nclass Animal {\n    public void makeSound() {\n        System.out.println(\"Some sound\");\n    }\n}\n\n// 子类\nclass Dog extends Animal {\n    @Override\n    public void makeSound() {\n        System.out.println(\"Bark\");\n    }\n}\n\nclass Cat extends Animal {\n    @Override\n    public void makeSound() {\n        System.out.println(\"Meow\");\n    }\n}\n\n// 使用多态\nAnimal animal1 = new Dog(); // 父类引用指向子类对象\nAnimal animal2 = new Cat();\n\nanimal1.makeSound(); // 输出 \"Bark\"\nanimal2.makeSound(); // 输出 \"Meow\"\n```"
        }
    ],
    'MySQL': [
        {
            question: "MySQL索引的类型有哪些？",
            answer: "MySQL索引的主要类型有：\n1. 普通索引（INDEX）：最基本的索引类型，没有任何限制\n2. 唯一索引（UNIQUE）：索引列的值必须唯一，但允许有空值\n3. 主键索引（PRIMARY KEY）：是一种特殊的唯一索引，不允许有空值\n4. 组合索引：在表的多个字段上创建的索引，查询时遵循最左前缀原则\n5. 全文索引（FULLTEXT）：用于全文搜索，只支持MyISAM和InnoDB引擎，且只支持CHAR、VARCHAR和TEXT类型的列\n6. 空间索引（SPATIAL）：用于地理空间数据类型的字段\n\n在底层实现上，MySQL的索引类型按照数据结构可分为：\n- B+Tree索引：最常用的索引类型，大部分引擎都支持\n- Hash索引：只有Memory引擎支持，查询单条数据很快\n- R-Tree索引：用于空间数据索引\n- Full-text索引：用于全文索引"
        }
    ],
    'MyBatis': [
        {
            question: "MyBatis中#{}和${}的区别是什么？",
            answer: "在MyBatis中，#{}和${}都是用于SQL语句参数的占位符，但它们有以下区别：\n\n#{}：\n1. 预编译处理，会将参数替换为?，然后调用PreparedStatement的set方法来设置参数值\n2. 可以防止SQL注入攻击\n3. 会自动添加引号\n\n${}：\n1. 直接文本替换，将参数的值直接替换到SQL语句中\n2. 不能防止SQL注入\n3. 不会自动添加引号\n\n使用场景：\n- #{}：适用于大多数参数传递的场景，特别是传递用户输入的参数时\n- ${}：主要用于传入数据库对象，如表名、列名等，或者用于ORDER BY子句"
        }
    ],
    '设计模式': [
        {
            question: "什么是设计模式？GoF设计模式分为哪几类？",
            answer: "设计模式是软件开发中解决特定问题的经过验证的通用解决方案，是一套被反复使用、多数人知晓的、经过分类编目的、代码设计经验的总结。\n\nGoF（Gang of Four）设计模式共23种，分为三大类：\n\n1. 创建型模式（Creational Patterns）：处理对象创建的设计模式，试图根据实际情况使用合适的方式创建对象。包括：\n   - 单例模式(Singleton)\n   - 工厂方法模式(Factory Method)\n   - 抽象工厂模式(Abstract Factory)\n   - 建造者模式(Builder)\n   - 原型模式(Prototype)\n\n2. 结构型模式（Structural Patterns）：关注类和对象的组合，继承的概念被用来组合接口和定义组合对象获得新功能的方式。包括：\n   - 适配器模式(Adapter)\n   - 桥接模式(Bridge)\n   - 组合模式(Composite)\n   - 装饰器模式(Decorator)\n   - 外观模式(Facade)\n   - 享元模式(Flyweight)\n   - 代理模式(Proxy)\n\n3. 行为型模式（Behavioral Patterns）：关注对象之间的通信，描述类或对象之间怎样交互和怎样分配职责。包括：\n   - 责任链模式(Chain of Responsibility)\n   - 命令模式(Command)\n   - 解释器模式(Interpreter)\n   - 迭代器模式(Iterator)\n   - 中介者模式(Mediator)\n   - 备忘录模式(Memento)\n   - 观察者模式(Observer)\n   - 状态模式(State)\n   - 策略模式(Strategy)\n   - 模板方法模式(Template Method)\n   - 访问者模式(Visitor)"
        },
        {
            question: "单例模式是什么？请介绍几种实现方式及其优缺点",
            answer: "单例模式（Singleton Pattern）是一种创建型设计模式，它保证一个类仅有一个实例，并提供一个全局访问点。\n\n主要实现方式及优缺点：\n\n1. 饿汉式（静态常量）：\n```java\npublic class Singleton {\n    private static final Singleton instance = new Singleton();\n    private Singleton() {}\n    public static Singleton getInstance() {\n        return instance;\n    }\n}\n```\n优点：线程安全，类加载时就初始化，避免了多线程同步问题\n缺点：可能造成资源浪费，因为不管是否使用都会创建实例\n\n2. 懒汉式（线程不安全）：\n```java\npublic class Singleton {\n    private static Singleton instance;\n    private Singleton() {}\n    public static Singleton getInstance() {\n        if (instance == null) {\n            instance = new Singleton();\n        }\n        return instance;\n    }\n}\n```\n优点：延迟加载，用到才创建\n缺点：线程不安全，多线程环境下可能创建多个实例\n\n3. 懒汉式（线程安全，同步方法）：\n```java\npublic class Singleton {\n    private static Singleton instance;\n    private Singleton() {}\n    public static synchronized Singleton getInstance() {\n        if (instance == null) {\n            instance = new Singleton();\n        }\n        return instance;\n    }\n}\n```\n优点：线程安全，延迟加载\n缺点：效率低，每次获取实例都需要同步\n\n4. 双重检查锁（DCL，Double-Checked Locking）：\n```java\npublic class Singleton {\n    private static volatile Singleton instance;\n    private Singleton() {}\n    public static Singleton getInstance() {\n        if (instance == null) {\n            synchronized (Singleton.class) {\n                if (instance == null) {\n                    instance = new Singleton();\n                }\n            }\n        }\n        return instance;\n    }\n}\n```\n优点：线程安全，延迟加载，效率较高\n缺点：实现复杂，需要使用volatile关键字确保可见性\n\n5. 静态内部类：\n```java\npublic class Singleton {\n    private Singleton() {}\n    private static class SingletonHolder {\n        private static final Singleton INSTANCE = new Singleton();\n    }\n    public static Singleton getInstance() {\n        return SingletonHolder.INSTANCE;\n    }\n}\n```\n优点：延迟加载，线程安全，利用了类加载机制保证初始化实例时只有一个线程\n缺点：相对复杂\n\n6. 枚举实现：\n```java\npublic enum Singleton {\n    INSTANCE;\n    // 可以添加方法\n}\n```\n优点：线程安全，防止反序列化重新创建新的对象，防止反射攻击\n缺点：不能实现懒加载"
        },
        {
            question: "工厂方法模式和抽象工厂模式有什么区别？",
            answer: "工厂方法模式和抽象工厂模式都是创建型设计模式，用于处理对象的创建，但二者有明显区别：\n\n1. 工厂方法模式（Factory Method Pattern）：\n   - 定义一个创建对象的接口，但由子类决定要实例化的类是哪一个，工厂方法让类的实例化推迟到子类中进行\n   - 专注于创建单一产品\n   - 通过继承来实现，每个具体工厂类只能创建对应的产品\n\n   示例：\n   ```java\n   // 产品接口\n   public interface Product {\n       void operation();\n   }\n\n   // 具体产品\n   public class ConcreteProduct implements Product {\n       @Override\n       public void operation() {\n           System.out.println(\"ConcreteProduct operation\");\n       }\n   }\n\n   // 工厂接口\n   public interface Factory {\n       Product createProduct();\n   }\n\n   // 具体工厂\n   public class ConcreteFactory implements Factory {\n       @Override\n       public Product createProduct() {\n           return new ConcreteProduct();\n       }\n   }\n   ```\n\n2. 抽象工厂模式（Abstract Factory Pattern）：\n   - 提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们具体的类\n   - 专注于创建一系列相关产品（产品族）\n   - 通过组合来实现，每个具体工厂可以创建多个不同种类但相关的产品\n\n   示例：\n   ```java\n   // 产品A接口\n   public interface ProductA {\n       void operationA();\n   }\n\n   // 产品B接口\n   public interface ProductB {\n       void operationB();\n   }\n\n   // 具体产品A1\n   public class ConcreteProductA1 implements ProductA {\n       @Override\n       public void operationA() {\n           System.out.println(\"ConcreteProductA1 operationA\");\n       }\n   }\n\n   // 具体产品B1\n   public class ConcreteProductB1 implements ProductB {\n       @Override\n       public void operationB() {\n           System.out.println(\"ConcreteProductB1 operationB\");\n       }\n   }\n\n   // 抽象工厂接口\n   public interface AbstractFactory {\n       ProductA createProductA();\n       ProductB createProductB();\n   }\n\n   // 具体工厂1\n   public class ConcreteFactory1 implements AbstractFactory {\n       @Override\n       public ProductA createProductA() {\n           return new ConcreteProductA1();\n       }\n\n       @Override\n       public ProductB createProductB() {\n           return new ConcreteProductB1();\n       }\n   }\n   ```\n\n主要区别：\n1. 目的不同：工厂方法模式关注单一产品的创建，抽象工厂模式关注多个相关产品的创建（产品族）\n2. 抽象程度不同：抽象工厂模式比工厂方法模式更抽象\n3. 实现方式不同：工厂方法主要通过继承实现，抽象工厂主要通过组合实现\n4. 扩展方式不同：工厂方法添加新产品需要添加新的工厂类，抽象工厂添加新产品族需要修改所有工厂实现"
        },
        {
            question: "什么是观察者模式？它在哪些场景下适用？",
            answer: "观察者模式（Observer Pattern）是一种行为型设计模式，它定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。当主题对象的状态发生变化时，所有依赖于它的观察者都会得到通知并自动更新。\n\n核心组件：\n1. Subject（主题）：被观察的对象，维护一组观察者，提供添加、删除观察者的方法\n2. Observer（观察者）：定义更新接口，当主题状态变化时更新自己\n3. ConcreteSubject（具体主题）：实现Subject接口，有自己的状态，当状态变化时通知所有观察者\n4. ConcreteObserver（具体观察者）：实现Observer接口，更新自己的状态以维持与主题一致\n\n示例代码：\n```java\n// 观察者接口\npublic interface Observer {\n    void update(String message);\n}\n\n// 主题接口\npublic interface Subject {\n    void registerObserver(Observer observer);\n    void removeObserver(Observer observer);\n    void notifyObservers();\n}\n\n// 具体主题\npublic class ConcreteSubject implements Subject {\n    private List<Observer> observers = new ArrayList<>();\n    private String message;\n\n    @Override\n    public void registerObserver(Observer observer) {\n        observers.add(observer);\n    }\n\n    @Override\n    public void removeObserver(Observer observer) {\n        observers.remove(observer);\n    }\n\n    @Override\n    public void notifyObservers() {\n        for (Observer observer : observers) {\n            observer.update(message);\n        }\n    }\n\n    public void setMessage(String message) {\n        this.message = message;\n        notifyObservers();\n    }\n}\n\n// 具体观察者\npublic class ConcreteObserver implements Observer {\n    private String name;\n\n    public ConcreteObserver(String name) {\n        this.name = name;\n    }\n\n    @Override\n    public void update(String message) {\n        System.out.println(name + \" received message: \" + message);\n    }\n}\n```\n\n适用场景：\n1. 当一个对象的改变需要同时改变其他对象，且不知道具体有多少对象需要改变时\n2. 当一个对象必须通知其他对象，但又希望它们松散耦合时\n3. 事件处理系统，如GUI框架中的事件监听\n4. 消息发布-订阅系统\n5. MVC架构中，Model通知View更新\n\n实际应用例子：\n1. Java中的java.util.Observable和java.util.Observer\n2. Spring框架中的事件机制\n3. JavaBeans中的PropertyChangeListener\n4. Android开发中的事件监听器\n5. JavaScript中的事件机制\n6. 消息中间件（RabbitMQ, Kafka等）的发布/订阅模式"
        },
        {
            question: "什么是策略模式？它与其他模式有什么区别？",
            answer: "策略模式（Strategy Pattern）是一种行为型设计模式，它定义了一系列算法，并将每个算法封装起来，使它们可以相互替换。策略模式让算法的变化独立于使用算法的客户端。\n\n核心组件：\n1. Strategy（策略）：策略的抽象，通常是一个接口，定义了一个算法族的共同方法\n2. ConcreteStrategy（具体策略）：实现了Strategy接口的具体算法\n3. Context（上下文）：持有一个Strategy的引用，并使用它执行相应的算法\n\n示例代码：\n```java\n// 策略接口\npublic interface PaymentStrategy {\n    void pay(int amount);\n}\n\n// 具体策略：信用卡支付\npublic class CreditCardPayment implements PaymentStrategy {\n    private String cardNumber;\n    private String name;\n\n    public CreditCardPayment(String cardNumber, String name) {\n        this.cardNumber = cardNumber;\n        this.name = name;\n    }\n\n    @Override\n    public void pay(int amount) {\n        System.out.println(amount + \" paid with credit card\");\n    }\n}\n\n// 具体策略：PayPal支付\npublic class PayPalPayment implements PaymentStrategy {\n    private String email;\n\n    public PayPalPayment(String email) {\n        this.email = email;\n    }\n\n    @Override\n    public void pay(int amount) {\n        System.out.println(amount + \" paid with PayPal\");\n    }\n}\n\n// 上下文\npublic class ShoppingCart {\n    private PaymentStrategy paymentStrategy;\n\n    public void setPaymentStrategy(PaymentStrategy paymentStrategy) {\n        this.paymentStrategy = paymentStrategy;\n    }\n\n    public void checkout(int amount) {\n        paymentStrategy.pay(amount);\n    }\n}\n```\n\n策略模式适用场景：\n1. 当需要在运行时选择不同的算法或行为时\n2. 当有许多类似的算法，只有行为细节不同时\n3. 当算法使用客户端不应该知道的数据时（数据封装）\n4. 当一个类定义了多种行为，并且这些行为在类的操作中以多个条件语句的形式出现时\n\n策略模式与其他模式的区别：\n\n1. 策略模式 vs 状态模式：\n   - 相似点：都有上下文和多个可能的行为/状态\n   - 不同点：状态模式中状态对象知道其他状态对象的存在，并控制状态转换；策略模式中策略对象之间互不了解，由客户端选择具体策略\n\n2. 策略模式 vs 模板方法模式：\n   - 相似点：都用于封装算法\n   - 不同点：模板方法使用继承来变化部分行为，策略模式使用组合和委托来替换整个算法\n\n3. 策略模式 vs 命令模式：\n   - 相似点：都可以在运行时改变行为\n   - 不同点：命令模式封装的是动作请求，侧重于解耦调用者和接收者；策略模式封装的是算法，侧重于提供可替换的算法\n\n4. 策略模式 vs 工厂模式：\n   - 相似点：都可以创建不同的对象\n   - 不同点：工厂模式创建对象后不参与后续操作；策略模式创建对象后还要运行特定算法\n\n实际应用例子：\n1. Java中的Comparator接口（用于集合排序）\n2. Spring框架中的Resource接口（不同资源访问策略）\n3. 日志框架中的不同日志输出方式\n4. 支付系统中的多种支付方式\n5. 验证框架中的不同验证算法"
        },
        {
            question: "适配器模式和装饰器模式有什么区别？",
            answer: "适配器模式和装饰器模式都是结构型设计模式，但它们解决的问题和使用场景不同：\n\n适配器模式（Adapter Pattern）：\n定义：将一个类的接口转换成客户端所期望的另一个接口，使得原本因接口不兼容而不能一起工作的类能一起工作。\n\n核心组件：\n1. Target（目标接口）：客户端所期望的接口\n2. Adaptee（适配者）：需要被适配的类/接口\n3. Adapter（适配器）：将Adaptee转换为Target接口的类\n\n示例代码（对象适配器）：\n```java\n// 目标接口\npublic interface MediaPlayer {\n    void play(String audioType, String fileName);\n}\n\n// 适配者接口\npublic interface AdvancedMediaPlayer {\n    void playVlc(String fileName);\n    void playMp4(String fileName);\n}\n\n// 具体适配者\npublic class VlcPlayer implements AdvancedMediaPlayer {\n    @Override\n    public void playVlc(String fileName) {\n        System.out.println(\"Playing vlc file: \" + fileName);\n    }\n\n    @Override\n    public void playMp4(String fileName) {\n        // 什么也不做\n    }\n}\n\n// 适配器\npublic class MediaAdapter implements MediaPlayer {\n    private AdvancedMediaPlayer advancedMusicPlayer;\n\n    public MediaAdapter(String audioType) {\n        if (audioType.equalsIgnoreCase(\"vlc\")) {\n            advancedMusicPlayer = new VlcPlayer();\n        } else if (audioType.equalsIgnoreCase(\"mp4\")) {\n            advancedMusicPlayer = new Mp4Player();\n        }\n    }\n\n    @Override\n    public void play(String audioType, String fileName) {\n        if (audioType.equalsIgnoreCase(\"vlc\")) {\n            advancedMusicPlayer.playVlc(fileName);\n        } else if (audioType.equalsIgnoreCase(\"mp4\")) {\n            advancedMusicPlayer.playMp4(fileName);\n        }\n    }\n}\n```\n\n装饰器模式（Decorator Pattern）：\n定义：动态地给一个对象添加一些额外的职责，比生成子类更为灵活。\n\n核心组件：\n1. Component（组件）：定义原始对象和装饰对象的公共接口\n2. ConcreteComponent（具体组件）：需要被装饰的原始对象\n3. Decorator（装饰器）：持有一个Component的引用并定义与Component一致的接口\n4. ConcreteDecorator（具体装饰器）：向组件添加职责的装饰器\n\n示例代码：\n```java\n// 组件接口\npublic interface Coffee {\n    String getDescription();\n    double getCost();\n}\n\n// 具体组件\npublic class SimpleCoffee implements Coffee {\n    @Override\n    public String getDescription() {\n        return \"Simple coffee\";\n    }\n\n    @Override\n    public double getCost() {\n        return 1.0;\n    }\n}\n\n// 装饰器\npublic abstract class CoffeeDecorator implements Coffee {\n    protected Coffee decoratedCoffee;\n\n    public CoffeeDecorator(Coffee decoratedCoffee) {\n        this.decoratedCoffee = decoratedCoffee;\n    }\n\n    @Override\n    public String getDescription() {\n        return decoratedCoffee.getDescription();\n    }\n\n    @Override\n    public double getCost() {\n        return decoratedCoffee.getCost();\n    }\n}\n\n// 具体装饰器\npublic class MilkDecorator extends CoffeeDecorator {\n    public MilkDecorator(Coffee decoratedCoffee) {\n        super(decoratedCoffee);\n    }\n\n    @Override\n    public String getDescription() {\n        return decoratedCoffee.getDescription() + \", milk\";\n    }\n\n    @Override\n    public double getCost() {\n        return decoratedCoffee.getCost() + 0.5;\n    }\n}\n```\n\n主要区别：\n\n1. 意图不同：\n   - 适配器模式：解决接口不兼容问题，使现有接口能够满足客户端需求\n   - 装饰器模式：在不改变原有对象的基础上，动态地添加功能\n\n2. 结构差异：\n   - 适配器模式：通常持有一个被适配对象的引用，并实现一个目标接口\n   - 装饰器模式：装饰器和被装饰对象实现相同的接口，且装饰器持有一个被装饰对象的引用\n\n3. 透明性：\n   - 适配器模式：对客户端隐藏了被适配对象的接口\n   - 装饰器模式：对客户端透明，客户端无需区分原始对象和装饰后的对象\n\n4. 应用场景：\n   - 适配器模式：用于使不兼容的接口能够一起工作，通常用于旧系统与新系统的集成\n   - 装饰器模式：用于动态添加、移除或组合功能，在不修改原有代码的情况下增强功能\n\n5. 设计意图：\n   - 适配器模式：改变接口，不改变功能\n   - 装饰器模式：保持接口，增强功能\n\n实际应用例子：\n- 适配器模式：Java的InputStreamReader和OutputStreamWriter\n- 装饰器模式：Java I/O流的设计（如BufferedInputStream, DataInputStream等）"
        }
    ]
}

// 数据结构一致性检查和自动修复
const normalizeCategories = (categoriesData) => {
    // 确保categories是一个数组
    if (!Array.isArray(categoriesData)) {
        console.error('分类数据不是数组格式，使用默认分类', categoriesData);
        return defaultCategories.map(name => ({ id: name, name }));
    }

    // 检查数组中的每一项，如果是字符串，转换为对象格式
    return categoriesData.map(category => {
        if (typeof category === 'string') {
            return { id: category, name: category };
        } else if (typeof category === 'object' && category !== null) {
            // 确保对象有id和name属性
            if (!category.id) {
                category.id = category.name || `category-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            }
            if (!category.name) {
                category.name = category.id;
            }
            return category;
        } else {
            console.error('无效的分类数据项:', category);
            return null;
        }
    }).filter(Boolean); // 过滤掉null值
};

const normalizeQuestions = (questionsData) => {
    if (typeof questionsData !== 'object' || questionsData === null) {
        console.error('问题数据不是对象格式，使用默认问题', questionsData);
        return { ...defaultInterviewQuestions };
    }

    const normalized = {};
    Object.keys(questionsData).forEach(categoryId => {
        const questions = questionsData[categoryId];
        if (!Array.isArray(questions)) {
            console.error(`分类 ${categoryId} 的问题不是数组格式，跳过`, questions);
            return;
        }

        normalized[categoryId] = questions.map(q => {
            if (typeof q !== 'object' || q === null) {
                console.error(`分类 ${categoryId} 中存在无效问题:`, q);
                return null;
            }

            // 确保问题有基本属性
            const normalizedQuestion = { ...q };
            if (!normalizedQuestion.id) {
                normalizedQuestion.id = `${categoryId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            }
            if (!normalizedQuestion.question) {
                normalizedQuestion.question = '未知问题';
            }
            if (!normalizedQuestion.answer) {
                normalizedQuestion.answer = '暂无参考答案';
            }

            return normalizedQuestion;
        }).filter(Boolean); // 过滤掉null值
    });

    return normalized;
};

// 使用localStorage中可能存在的自定义数据
let categories = [...defaultCategories].map(name => ({ id: name, name }));
let interviewQuestions = { ...defaultInterviewQuestions };

// 尝试从localStorage加载自定义数据
try {
    const storedData = localStorage.getItem('interview-helper-data');
    if (storedData) {
        const customData = JSON.parse(storedData);

        // 标准化categories数据结构
        if (customData.categories) {
            categories = normalizeCategories(customData.categories);
            console.log('已加载并标准化分类数据，数量:', categories.length);
        }

        // 标准化questions数据结构
        if (customData.interviewQuestions) {
            interviewQuestions = normalizeQuestions(customData.interviewQuestions);
            const totalQuestions = Object.values(interviewQuestions).reduce(
                (sum, questions) => sum + questions.length, 0
            );
            console.log('已加载并标准化问题数据，总数:', totalQuestions);
        }
    }
} catch (error) {
    console.error('加载自定义数据失败，使用默认数据:', error);
}

export { categories, interviewQuestions } 