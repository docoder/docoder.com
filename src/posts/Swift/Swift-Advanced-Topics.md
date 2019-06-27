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

```swift
protocol Account { 
  associatedtype Currency
	var balance: Currency { get }
  func deposit(amount: Currency) 
  func withdraw(amount: Currency)
}

typealias Dollars = Double
/// A U.S. Dollar based "basic" account. 
class BasicAccount: Account {
	private(set) var balance: Dollars = 0.0 // private set, 外部不可修改
	func deposit(amount: Dollars) { 
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

class CheckingAccount: BasicAccount { 
  private let accountNumber = UUID().uuidString // private, 外部不可读取或修改
	class Check {
		let account: String 
    var amount: Dollars 
    private(set) var cashed = false
		func cash() { 
      cashed = true 
    }
		init(amount: Dollars, from account: CheckingAccount) { 
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

