---
title: Swift Advanced Topics
date: "2019-06-27"
---

##Access Control

**private**

- 在此类型内部可访问
- 此类型的嵌套类型内部可访问, 词法作用域
- 在相同文件的此类型的扩展 (extensions) 内部可访问

**fileprivate**

- 在相同文件内部可访问

**internal**

- 默认的访问控制类型
- 在相同 module 内部可访问

**public**

- 在相同 module 内部可访问
- 被 import，可访问

**open**

- 与 public 相同
- 但能被其他 module 里的代码 override
  - class 继承
  - method 重写
  - property 重写

```swift
protocol Account { 
  associatedtype Currency
	var balance: Currency { get }
  func deposit(amount: Currency) 
  func withdraw(amount: Currency)
}

typealias Dollars = Double
/// A U.S. Dollar based "basic" account. 
open class BasicAccount: Account {
	// private(set) var balance: Dollars = 0.0 // private set, 外部不可修改
  public var balance: Dollars = 0.0
  public init() { }
	public func deposit(amount: Dollars) { 
    balance += amount 
  }
	func withdraw(amount: Dollars) { 
    if amount <= balance { 
      balance -= amount 
    } else { 
      balance = 0 
    } 
  }
}

public class CheckingAccount: BasicAccount { 
  private let accountNumber = UUID().uuidString // private, 外部不可读取或修改
	class Check {
		let account: String 
    var amount: Dollars 
    private(set) var cashed = false
		func cash() { 
      cashed = true 
    }
		fileprivate init(amount: Dollars, from account: CheckingAccount) {  //fileprivate, 相同文件内可访问
      self.amount = amount 
      self.account = account.accountNumber 
    }
	}
  func writeCheck(amount: Dollars) -> Check? { 
    guard balance > amount else { 
      return nil 
    }
		let check = Check(amount: amount, from: self) 
    withdraw(amount: check.amount) 
    return check
	}

	func deposit(_ check: Check) { 
    guard !check.cashed else { 
      return 
    }
    deposit(amount: check.amount) 
    check.cash()
	}
}

let johnChecking = CheckingAccount() // John 创建了支票账户
johnChecking.deposit(amount: 300.00) // John 存了 300 
let check = johnChecking.writeCheck(amount: 200.0)! // John 开了一张 200 的支票
let janeChecking = CheckingAccount() // Jane 创建了支票账户
janeChecking.deposit(check) // Jane 将 John 开的支票存进了她的账户
janeChecking.balance // Jane 账户现在有 200
 
janeChecking.deposit(check) // 支票已作废不能再存
janeChecking.balance // Jane 账户现在还是有 200
```

```swift
let johnChecking = CheckingAccount() // 因为 CheckingAccount 为 public

class SavingsAccount: BasicAccount { // 因为 BasicAccount 为 open
  var interestRate: Double
  init(interestRate: Double) { 
    self.interestRate = interestRate
  }
  func processInterest() { 
    let interest = balance * interestRate
    deposit(amount: interest)
	}
}
```

## 用扩展组织代码

###By behavior

```swift
public class CheckingAccount: BasicAccount { 
	private var issuedChecks: [Int] = [] 
  private var currentCheck = 1
}

private extension CheckingAccount { // private 使扩展中方法仅能被 CheckingAccount 使用，外部不能使用
	func inspectForFraud(with checkNumber: Int) -> Bool { 
    return issuedChecks.contains(checkNumber) 
  }
  func nextNumber() -> Int { 
    let next = currentCheck 
    currentCheck += 1 
    return next 
  }
}
```

###By protocol conformance

```swift
extension CheckingAccount: CustomStringConvertible { 
  public var description: String { 
    return "Checking Balance: $\(balance)" 
  } 
}
```

###available()

**old**

```swift
class SavingsAccount: BasicAccount {
  var interestRate: Double
  
  //第一个参数 "*" 表示影响哪些平台 (*, iOS, iOSMac, tvOS or watchOS)
  @available(*, deprecated, message: "Use init(interestRate:pin:) instead")
  init(interestRate: Double) { 
    self.interestRate = interestRate
  }
  
  @available(*, deprecated, message: "Use processInterest(pin:) instead")
  func processInterest() { 
    let interest = balance * interestRate
    deposit(amount: interest)
	}
}
```

**new**

```swift
class SavingsAccount: BasicAccount { 
  var interestRate: Double 
  private let pin: Int
	init(interestRate: Double, pin: Int) { 
    self.interestRate = interestRate 
    self.pin = pin 
  }
	func processInterest(pin: Int) {
    if pin == self.pin { 
      let interest = balance * interestRate 
      deposit(amount: interest) 
    }
	}
}
```

## 自定义运算符

- preﬁx, postﬁx,  inﬁx

```swift
infix operator **		// preﬁx, postﬁx, inﬁx
func **(base: Int, power: Int) -> Int { 
  precondition(power >= 2) 
  var result = base 
  for _ in 2...power { 
    result *= base 
  }
  return result
}

let base = 2 
let exponent = 2 
let result = base ** exponent

infix operator **=

func **=(lhs: inout Int, rhs: Int) { 
  lhs = lhs ** rhs 
}
var number = 2 
number **= exponent
```

###Generic operators

```swift
func **<T: BinaryInteger>(base: T, power: Int) -> T { //使用泛型使之适用于所有 integer 类型
  precondition(power >= 2) 
  var result = base 
  for _ in 2...power { 
    result *= base 
  } 
  return result 
}

func **=<T: BinaryInteger>(lhs: inout T, rhs: Int) { 
  lhs = lhs ** rhs 
}
```

### 优先级和顺序

**Precedence and associativity**

```swift
2 * 2 ** 3 ** 2 // Does not compile!
2 * (2 ** (3 ** 2))

precedencegroup ExponentiationPrecedence { 
  associativity: right // 指定优先顺序
  higherThan: MultiplicationPrecedence // 指定优先级高于乘法
}
infix operator **: ExponentiationPrecedence

2 * 2 ** 3 ** 2 // 可以正常编译运行了
```

## Subscripts

```swift
subscript(parameterList) -> ReturnType { // 不能用 inout 或 默认参数
  get { 
    // return someValue of ReturnType 
  }
	set(newValue) { // 可选, newValue 的类型为 ReturnType
    // set someValue of ReturnType to newValue 
  }
}
```

```swift
class Person {
	let name: String 
  let age: Int
	init(name: String, age: Int) { 
    self.name = name 
    self.age = age 
  }
}
let me = Person(name: "Cosmin", age: 32)

extension Person {
	subscript(key: String) -> String? { 
    switch key { 
      case "name":
				return name
      case "age":
				return "\(age)"
      default:
      	return nil
    }
}
me["name"] // Cosmin
me["age"] // 32
me["gender"] // nil
```

### Parameters

```swift
subscript(property key: String) -> String? { 
  ...
}
me[property: "name"] 
me[property: "age"] 
me[property: "gender"]
```

###Dynamic member lookup

- `@dynamicMemberLookup` 提供  `.` 语法
- 不能表明意图，编译期无限制，不要滥用

```swift
@dynamicMemberLookup // 开启 Subscripts 点语法
class Instrument {
	let brand: String 
  let year: Int 
  private let details: [String: String]
	init(brand: String, year: Int, details: [String: String]) { 
    self.brand = brand 
    self.year = year 
    self.details = details 
  }
	subscript(dynamicMember key: String) -> String {  // 实现 subscript(dynamicMember:)
    switch key { 
      case "info":
      	return "\(brand) made in \(year)."
			default:
      	return details[key] ?? "" 
    } 
  }
}

let instrument = Instrument(brand: "Roland", year: 2018, details: ["type": "accoustic", "pitch": "C"]) 
instrument.info // Roland made in 2018
instrument.pitch // C
instrument.abcd // "" // 运行时决定，编译时不报错

instrument.brand // "Roland" 
instrument.year // 2018

class Guitar: Instrument {} // 继承父类，调用父类的 dynamic member lookup
let guitar = Guitar(brand: "Fender", year: 2018, details: ["type": "electric", "pitch": "C"]) 
guitar.info
```

## Keypaths

- 存储属性的引用
- 可以存储需要一层一层深入访问的属性的引用
- 可以 append
- 优点
  - 可以参数化属性，而不用硬编码
  - 可以将 keypath 用变量存储，灵活

```swift
class Tutorial {
	let title: String 
  let author: Person 
  let type: String 
  let publishDate: Date
	init(title: String, author: Person, type: String, publishDate: Date) { 
    self.title = title 
    self.author = author 
    self.type = type 
    self.publishDate = publishDate 
  }
}

let tutorial = Tutorial(
  title: "Object Oriented Programming in Swift", 
  author: me, 
  type: "Swift", 
  publishDate: Date()
)

let title = \Tutorial.title // 为类 Tutorial 的 title 属性创建一个 keypath
let tutorialTitle = tutorial[keyPath: title] // 访问 keypath 的值

let authorName = \Tutorial.author.name // 需多层访问的属性
var tutorialAuthor = tutorial[keyPath: authorName]

let authorPath = \Tutorial.author 
let authorNamePath = authorPath.appending(path: \.name) // append
tutorialAuthor = tutorial[keyPath: authorNamePath]
```

### 设置属性

```swift
class Jukebox { 
  var song: String
  init(song: String) { 
    self.song = song 
  }
}

let jukebox = Jukebox(song: "Nothing else matters")

let song = \Jukebox.song 
jukebox[keyPath: song] = "Stairway to heaven"
```

