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
    ]
}

// 使用localStorage中可能存在的自定义数据
let categories = [...defaultCategories]
let interviewQuestions = { ...defaultInterviewQuestions }

// 尝试从localStorage加载自定义数据
try {
    const storedData = localStorage.getItem('interview-helper-data')
    if (storedData) {
        const customData = JSON.parse(storedData)
        if (customData.categories && Array.isArray(customData.categories)) {
            categories = customData.categories
        }
        if (customData.interviewQuestions && typeof customData.interviewQuestions === 'object') {
            interviewQuestions = customData.interviewQuestions
        }
        console.log('已从本地存储加载自定义数据')
    }
} catch (error) {
    console.error('加载自定义数据失败，使用默认数据:', error)
}

export { categories, interviewQuestions } 