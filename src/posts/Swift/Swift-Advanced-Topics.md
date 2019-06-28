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

2 * 2 ** 3 ** 2 
```

