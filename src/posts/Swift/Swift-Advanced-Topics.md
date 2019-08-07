---
title: Swift Advanced Topics
date: "2019-06-27"
---

## Access Control

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

### By behavior

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

### By protocol conformance

```swift
extension CheckingAccount: CustomStringConvertible { 
  public var description: String { 
    return "Checking Balance: $\(balance)" 
  } 
}
```

### available()

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

### Generic operators

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

### Dynamic member lookup

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

## Pattern matching

```swift
let coordinate = (x: 1, y: 0, z: 0)

if case (_, 0, 0) = coordinate { 
  print("along the x-axis") 
}
// 等价于
if (coordinate.y == 0) && (coordinate.z == 0) { 
  print("along the x-axis") 
}
```

### if

```swift
func process(point: (x: Int, y: Int, z: Int)) -> String { 
  if case (0, 0, 0) = point { 
    return "At origin" 
  } 
  return "Not at origin" 
}

let point = (x: 0, y: 0, z: 0) 
let response = process(point: point) // At origin
```

### guard

```swift
func process(point: (x: Int, y: Int, z: Int)) -> String { 
  guard case (0, 0, 0) = point else { 
    return "Not at origin" 
  } // guaranteed point is at the origin 
  return "At origin" 
}
```

### Switch

```swift
func process(point: (x: Int, y: Int, z: Int)) -> String { 
  let closeRange = -2...2 
  let midRange = -5...5
  switch point { 
    case (0, 0, 0):
			return "At origin" 
    case (closeRange, closeRange, closeRange):
			return "Very close to origin" 
    case (midRange, midRange, midRange):
    	return "Nearby origin" 
    default:
    	return "Not near origin" 
  }
}

let point = (x: 15, y: 5, z: 3) 
let response = process(point: point) // Not near origin
```

### for

```swift
let groupSizes = [1, 5, 4, 6, 2, 1, 3] 
for case 1 in groupSizes { 
  print("Found an individual") // 2 times 
}
```

### Pattens

#### Wildcard pattern

```swift
if case (_, 0, 0) = coordinate { 
  // x can be any value. y and z must be exactly 0. 
  print("On the x-axis") // Printed!
}
```

#### Value-binding pattern

```swift
if case (let x, 0, 0) = coordinate { 
  print("On the x-axis at \(x)") // Printed: 1 
}

if case let (x, y, 0) = coordinate { 
  print("On the x-y plane at (\(x), \(y))") // Printed: 1, 0 
}
```

#### Enumeration case pattern

```swift
enum Direction { 
  case north, south, east, west 
} 
let heading = Direction.north 
if case .north = heading {
  print("Don't forget your jacket")
}

enum Organism { 
  case plant 
  case animal(legs: Int) 
}

let pet = Organism.animal(legs: 4)
switch pet { 
  case .animal(let legs):
		print("Potentially cuddly with \(legs) legs") // Printed: 4 
  default:
		print("No chance for cuddles") 
}
```

#### Optional pattern

```swift
let names: [String?] = ["Michelle", nil, "Brandon", "Christine", nil, "David"]
for case let name? in names {
  print(name) // 4 times 
}
```

#### “Is” type-casting pattern

```swift
let array: [Any] = [15, "George", 2.0]
for element in array { 
  switch element { 
    case is String:
    	print("Found a string") // 1 time 
    default:
			print("Found something else") // 2 times 
  } 
}
```

#### “As” type-casting pattern

```swift
for element in array { 
  switch element { 
  case let text as String:
    print("Found a string: \(text)") // 1 time 
  default:
    print("Found something else") // 2 times
	} 
}
```

#### Qualifying with where

```swift
for number in 1...9 { 
  switch number { 
  case let x where x % 2 == 0:
		print("even") // 4 times 
  default:
		print("odd") // 5 times 
  } 
}
```

```swift
enum LevelStatus { 
  case complete 
  case inProgress(percent: Double) 
  case notStarted 
}

let levels: [LevelStatus] = [.complete, .inProgress(percent: 0.9), .notStarted]

for level in levels {
	switch level { 
    case .inProgress(let percent) where percent > 0.8 :
			print("Almost there!") 
    case .inProgress(let percent) where percent > 0.5 :
			print("Halfway there!") 
    case .inProgress(let percent) where percent > 0.2 :
			print("Made it through the beginning!") 
    default:
			break 
  }
}
```

#### Chaining with commas

- **Simple logical test**, 如: foo == 10 || bar > baz
- **Optional binding**, 如: let foo = maybeFoo
- **Pattern matching**, 如: case .bar(let something) = theValue

```swift
func timeOfDayDescription(hour: Int) -> String { 
  switch hour { 
    case 0, 1, 2, 3, 4, 5:
      return "Early morning" 
    case 6, 7, 8, 9, 10, 11:
      return "Morning" 
    case 12, 13, 14, 15, 16:
      return "Afternoon" 
    case 17, 18, 19:
      return "Evening" 
    case 20, 21, 22, 23:
      return "Late evening" 
    default:
      return "INVALID HOUR!"
  }
} 

let timeOfDay = timeOfDayDescription(hour: 12) // Afternoon

if case .animal(let legs) = pet, case 2...4 = legs { 
  print("potentially cuddly") // Printed!
} else {
	print("no chance for cuddles") 
}
```

```swift
enum Number { 
  case integerValue(Int) 
  case doubleValue(Double) 
  case booleanValue(Bool) 
}

let a = 5 
let b = 6 
let c: Number? = .integerValue(7) 
let d: Number? = .integerValue(8)

if a != b {
	if let c = c { 
    if let d = d { 
      if case .integerValue(let cValue) = c { 
        if case .integerValue(let dValue) = d { 
          if dValue > cValue { 
            print("a and b are different") // Printed! 
            print("d is greater than c") // Printed! 
            print("sum: \(a + b + cValue + dValue)") // 26 
          } 
        } 
      }
		}
	}
}
// 等价于
if a != b,
	let c = c, 
	let d = d, 
	case .integerValue(let cValue) = c, 
	case .integerValue(let dValue) = d, 
	dValue > cValue { 
    print("a and b are different") // Printed!
		print("d is greater than c") // Printed!
		print("sum: \(a + b + cValue + dValue)") // Printed: 26
}
```

#### Custom tuple

```swift
let name = "Bob" 
let age = 23

if case ("Bob", 23) = (name, age) { 
  print("Found the right Bob!") // Printed! 
}
```

```swift
var username: String? 
var password: String?

switch (username, password) { 
  case let (username?, password?):
		print("Success! User: \(username) Pass: \(password)") 
  case let (username?, nil):
		print("Password is missing. User: \(username)") 
  case let (nil, password?):
  	print("Username is missing. Pass: \(password)") 
  case (nil, nil):
		print("Both username and password are missing") // Printed! 
}
```

#### Fun with wildcards

```swift
for _ in 1...3 { 
  print("hi") // 3 times 
}
```

#### Validate that an optional exists

```swift
let user: String? = "Bob" 
guard let _ = user else {
	print("There is no user.")
	fatalError() 
} 
print("User exists, but identity not needed.") // Printed!
// 等价于
guard user != nil else { // 更具表意
  print("There is no user.") fatalError() 
}
```

#### Organize an if-else-if

```swift
struct Rectangle { 
  let width: Int 
  let height: Int 
  let color: String 
}

let view = Rectangle(width: 15, height: 60, color: "Green") 
switch view { 
  case _ where view.height < 50:
		print("Shorter than 50 units") 
  case _ where view.width > 20:
		print("Over 50 tall, & over 20 wide") 
  case _ where view.color == "Green":
		print("Over 50 tall, at most 20 wide, & green") // Printed! 
  default:
		print("This view can't be described by this example") 
}
```

### Expression pattern

- `~=` 表示一个 integer 是否落在一个 range 内
- `if case` 功能上与 `~=` 等价

```swift
let matched = (1...10 ~= 5) // true
//等价于
if case 1...10 = 5 {
  print("In the range")
}
```

####  Overloading ~=

```swift
let list = [0, 1, 2, 3] 
let integer = 2 
let isInArray = (list ~= integer) // Error! 
if case list = integer { // Error!
	print("The integer is in the array") 
} else {
  print("The integer is not in the array")
}


func ~=(pattern: [Int], value: Int) -> Bool {
  for i in pattern { 
    if i == value { 
      return true 
    } 
  } 
  return false
}

let isInArray = (list ~= integer) // true
if case list = integer { 
  print("The integer is in the array") // Printed! 
} else {
	print("The integer is not in the array") 
}
```

## Error Handing

### Optional

#### Failable initializers

```swift
let value = Int("3") // Optional(3) 
let failedValue = Int("nope") // nil

enum PetFood: String { 
  case kibble, canned 
}
let morning = PetFood(rawValue: "kibble") // Optional(.kibble)
let snack = PetFood(rawValue: "fuuud!") // nil

struct PetHouse { 
  let squareFeet: Int
  // 用 init? 创建一个 Failable initializer. 保证实例有正确的属性, 否则就不存在
	init?(squareFeet: Int) { 
    if squareFeet < 1 { 
      return nil 
    } 
    self.squareFeet = squareFeet 
  }
}
let tooSmall = PetHouse(squareFeet: 0) // nil 
let house = PetHouse(squareFeet: 1) // Optional(Pethouse)
```

#### Optional chaining

```swift
class Pet { 
  var breed: String?
	init(breed: String? = nil) { 
    self.breed = breed 
  }
}
class Person { 
  let pet: Pet
	init(pet: Pet) { 
    self.pet = pet 
  }
}
let delia = Pet(breed: "pug") 
let olive = Pet()
let janie = Person(pet: olive) 
let dogBreed = janie.pet.breed! // This is bad! Will cause a crash!

// 标准的 optional 处理
if let dogBreed = janie.pet.breed { 
  print("Olive is a \(dogBreed)") 
} else {
	print("Olive's breed is unknown.") 
}
```

```swift
class Toy {
	enum Kind { 
    case ball 
    case zombie 
    case bone 
    case mouse 
  }
	enum Sound { 
    case squeak 
    case bell 
  }
	let kind: Kind 
  let color: String 
  var sound: Sound?
	init(kind: Kind, color: String, sound: Sound? = nil) { 
    self.kind = kind 
    self.color = color 
    self.sound = sound 
  }
}
class Pet {
	enum Kind { 
    case dog 
    case cat 
    case guineaPig 
  }
	let name: String 
  let kind: Kind 
  let favoriteToy: Toy?
	init(name: String, kind: Kind, favoriteToy: Toy? = nil) { 
    self.name = name 
    self.kind = kind 
    self.favoriteToy = favoriteToy 
  }
}
class Person { 
  let pet: Pet?
	init(pet: Pet? = nil) { 
    self.pet = pet 
  }
}

let janie = Person(
  pet: Pet(
    name: "Delia", 
    kind: .dog, 
    favoriteToy: Toy(
      kind: .ball, 
      color: "Purple", 
      sound: .bell
    )
  )
) 
let tammy = Person(
  pet: Pet(
    name: "Evil Cat Overlord", 
    kind: .cat, 
    favoriteToy: Toy(
      kind: .mouse, 
      color: "Orange"
    )
  )
) 
let felipe = Person()

if let sound = janie.pet?.favoriteToy?.sound { // optional chaining
  print("Sound \(sound)") 
} else {
	print("No sound.") 
}

if let sound = tammy.pet?.favoriteToy?.sound { 
  print("Sound \(sound)") 
} else {
	print("No sound.") 
}

if let sound = felipe.pet?.favoriteToy?.sound { 
  print("Sound \(sound)") 
} else {
	print("No sound.") 
}
```

#### Map and compactMap

```swift
let team = [janie, tammy, felipe]
let petNames = team.map { $0.pet?.name }
for pet in petNames { 
  print(pet) 
}
// Optional("Delia") 
// Optional("Evil Cat Overlord") 
// nil

// compactMap flatten [Optional<String>] -> [String]
let betterPetNames = team.compactMap { $0.pet?.name } 
for pet in betterPetNames { 
  print(pet) 
}
// Delia
// Evil Cat Overlord
```

### Error protocol

```swift
class Pastry {
	let flavor: String 
  var numberOnHand: Int
	init(flavor: String, numberOnHand: Int) { 
    self.flavor = flavor 
    self.numberOnHand = numberOnHand 
  }
}

enum BakeryError: Error { 
  case tooFew(numberOnHand: Int) 
  case doNotSell 
  case wrongFlavor
}

class Bakery {
	var itemsForSale = [ 
    "Cookie": Pastry(flavor: "ChocolateChip", numberOnHand: 20), 
    "PopTart": Pastry(flavor: "WildBerry", numberOnHand: 13), 
    "Donut" : Pastry(flavor: "Sprinkles", numberOnHand: 24), 
    "HandPie": Pastry(flavor: "Cherry", numberOnHand: 6) 
  ]
	func orderPastry(
    item: String, 
    amountRequested: Int, 
    flavor: String) throws -> Int { // throw errors
    
    guard let pastry = itemsForSale[item] else { 
      throw BakeryError.doNotSell 
    }
    
  	guard flavor == pastry.flavor else {
			throw BakeryError.wrongFlavor 
    } 
    
    guard amountRequested <= pastry.numberOnHand else {
			throw BakeryError.tooFew(numberOnHand: pastry.numberOnHand) 
    } 
    
    pastry.numberOnHand -= amountRequested
		return pastry.numberOnHand
	}
}

let bakery = Bakery()
// handle errors
do {
	try bakery.orderPastry(item: "Albatross", amountRequested: 1, flavor: "AlbatrossFlavor") 
} catch BakeryError.doNotSell {
	print("Sorry, but we don't sell this item") 
} catch BakeryError.wrongFlavor {
	print("Sorry, but we don't carry this flavor") 
} catch BakeryError.tooFew {
	print("Sorry, we don't have enough items to fulfill your order") 
}
```

#### try ?

- 不关心 error 的具体细节. 
- try? 包装成 Optional, 
- 若抛错, 则返回 nil

```swift
let remaining = try? bakery.orderPastry(item: "Albatross", amountRequested: 1, flavor: "AlbatrossFlavor")
```

#### try !

- 确切知道代码不会报错
- 小心使用, 若抛错程序会崩溃

```swift
try! bakery.orderPastry(item: "Cookie", amountRequested: 1, flavor: "ChocolateChip")
// 等价于
do { 
  try bakery.orderPastry(item: "Cookie", amountRequested: 1, flavor: "ChocolateChip") 
} catch {
	fatalError() 
}
```

### Example: PugBot

```swift
enum Direction { 
  case left 
  case right 
  case forward 
}
enum PugBotError: Error { 
  case invalidMove(found: Direction, expected: Direction) 
  case endOfPath 
}

class PugBot {
	let name: String 
  let correctPath: [Direction] 
  private var currentStepInPath = 0
	init(name: String, correctPath: [Direction]) { 
    self.correctPath = correctPath 
    self.name = name 
  }
	func turnLeft() throws {
		guard currentStepInPath < correctPath.count else { 
      throw PugBotError.endOfPath 
    } 
    let nextDirection = correctPath[currentStepInPath] 
    guard nextDirection == .left else {
			throw PugBotError.invalidMove(found: .left, expected: nextDirection) 
    } 
    currentStepInPath += 1
  }

  func turnRight() throws {
    guard currentStepInPath < correctPath.count else { 
      throw PugBotError.endOfPath 
    } 
    let nextDirection = correctPath[currentStepInPath] 
    guard nextDirection == .right else {
      throw PugBotError.invalidMove(found: .right, expected: nextDirection) 
    } 
    currentStepInPath += 1
  }

  func moveForward() throws {
    guard currentStepInPath < correctPath.count else { 
      throw PugBotError.endOfPath
    } 
    let nextDirection = correctPath[currentStepInPath] 
    guard nextDirection == .forward else {
      throw PugBotError.invalidMove(found: .forward, expected: nextDirection)
    } 
    currentStepInPath += 1
  }

  func reset() { 
    currentStepInPath = 0 
  }
}

let pug = PugBot(name: "Pug", correctPath: [.forward, .left, .forward, .right])

func goHome() throws { 
  try pug.moveForward() 
  try pug.turnLeft() 
  try pug.moveForward() 
  try pug.turnRight() 
}

do { 
  try goHome() 
} catch {
	print("PugBot failed to get home.") 
}
```

#### Handling multiple errors

```swift
func moveSafely(_ movement: () throws -> ()) -> String {
	do { 
    try movement() 
    return "Completed operation successfully."
	} catch PugBotError.invalidMove(let found, let expected) {
		return "The PugBot was supposed to move \(expected), but moved \(found) instead."
	} catch PugBotError.endOfPath {
		return "The PugBot tried to move past the end of the path." 
  } catch { // 必需一个默认的 catch. 虽然是枚举类型.
		return "An unknown error occurred" 
  }
}

pug.reset() 
moveSafely(goHome)

pug.reset() 
// trailing closure syntax (尾闭包语法)
moveSafely { 
  try pug.moveForward() 
  try pug.turnLeft() 
  try pug.moveForward() 
  try pug.turnRight() 
}
```

#### Rethrows

当函数接收一个会抛出异常的闭包作为参数时:

- catch 每个异常
- 把异常再抛出
- `rethrow` 表示仅会把传入的函数抛出的异常给抛出，而不会抛出其自身的异常

```swift
func perform(times: Int, movement: () throws -> ()) rethrows { 
  for _ in 1...times { 
    try movement() 
  } 
}
```

## 序列化和反序列化

### Protocols

#### Encodable

```swift
func encode(to: Encoder) throws
```

#### Decodable

```swift
init(from decoder: Decoder) throws
```

#### Codable

```swift
typealias Codable = Encodable & Decodable
```

### Automatic

**Automatic encoding and decoding**

- Int, String, Date, Array, Dictionary 和其他一些标准库以及 Foundation 中的类型
- 实现 Codable 协议并且所有存储属性也都实现了 Codable 协议

```swift
struct Employee: Codable { 
  var name: String 
  var id: Int 
  var favoriteToy: Toy?
}

struct Toy: Codable { 
  var name: String 
}
```

### Custom types

#### JSONEncoder and JSONDecoder

```swift
let toy1 = Toy(name: "Teddy Bear"); 
let employee1 = Employee(name: "John Appleseed", id: 7, favoriteToy: toy1)

let jsonEncoder = JSONEncoder() 
let jsonData = try jsonEncoder.encode(employee1) 

let jsonString = String(data: jsonData, encoding: .utf8)! 
print(jsonString) // {"name":"John Appleseed","id":7,"favoriteToy":{"name":"Teddy Bear"}}

let jsonDecoder = JSONDecoder() 
let employee2 = try jsonDecoder.decode(Employee.self, from: jsonData)
```

### CodingKey

**序列化时重命名属性**

- 枚举类型，可以嵌套在需序列化的类型里
- 实现 `CodingKey` 协议
- 用 String 作为 the raw type
- 必须在枚举里包含所有属性，即使不需重命名的属性
- 此枚举的实例默认会被编译器创建，我们只需实现好此枚举即可

```swift
struct Employee: Codable { 
  var name: String 
  var id: Int 
  var favoriteToy: Toy?
	enum CodingKeys: String, CodingKey { 
    case id = "employeeId" 
    case name 
    case favoriteToy 
  }
}
// { "employeeId": 7, "name": "John Appleseed", "favoriteToy": {"name": "Teddy Bear"}}
```

### Manual encoding and decoding

如需要 JSON 为: `{ "employeeId": 7, "name": "John Appleseed", "gift": "Teddy Bear" }` 

不仅仅重命名属性, 而是修改了 JSON 结构

```swift
struct Employee { // remove Employee’s conformance to Codable (Encodable & Decodable)
  var name: String 
  var id: Int 
  var favoriteToy: Toy?
	enum CodingKeys: String, CodingKey { 
    case id = "employeeId" 
    case name 
    case gift
  }
}
// Encodable (instance -> string)
extension Employee: Encodable { 
  func encode(to encoder: Encoder) throws { 
    //1. get the container of the encoder
    var container = encoder.container(keyedBy: CodingKeys.self) 
    //2. choose which properties to encode for which keys
    try container.encode(name, forKey: .name) 
    try container.encode(id, forKey: .id) 
    // ﬂatten favoriteToy?.name down to the .gift key
    try container.encode(favoriteToy?.name, forKey: .gift) 
  } 
}
// Decodable (string -> instance)
extension Employee: Decodable {
	init(from decoder: Decoder) throws { 
    let values = try decoder.container(keyedBy: CodingKeys.self) 
    name = try values.decode(String.self, forKey: .name) 
    id = try values.decode(Int.self, forKey: .id) 
    if let gift = try values.decode(String?.self, forKey: .gift) { 
      favoriteToy = Toy(name: gift) 
    } 
  }
}
```

#### encodeIfPresent and decodeIfPresent

```swift
extension Employee: Encodable { 
  func encode(to encoder: Encoder) throws { 
    var container = encoder.container(keyedBy: CodingKeys.self) 
    try container.encode(name, forKey: .name) 
    try container.encode(id, forKey: .id) 
    // 如果有值才进行 encode, 避免出现 null
    try container.encodeIfPresent(favoriteToy?.name, forKey: .gift) 
  } 
}

extension Employee: Decodable {
	init(from decoder: Decoder) throws { 
    let values = try decoder.container(keyedBy: CodingKeys.self) 
    name = try values.decode(String.self, forKey: .name) 
    id = try values.decode(Int.self, forKey: .id) 
    if let gift = try values.decodeIfPresent(String.self, forKey: .gift) { 
      favoriteToy = Toy(name: gift) 
    }
  }
}
```

## 内存管理

### Reference cycles

```swift
class Tutorial {
	let title: String 
  var editor: Editor?
	init(title: String) { 
    self.title = title 
  }
	deinit { 
    print("Goodbye Tutorial \(title)!") 
  }
}

class Editor {
	let name: String 
  var tutorials: [Tutorial] = []
	init(name: String) { 
    self.name = name 
  }
	deinit { 
    print("Goodbye Editor \(name)!") 
  }
}

do { 
  let tutorial = Tutorial(title: "Memory management") 
  let editor = Editor(name: "Ray") 
  // 下面两句造成了循环引用
  tutorial.editor = editor 
  editor.tutorials.append(tutorial) 
}
//循环引用后运行到作用域外（大括号外）后不会被清理，造成内存泄漏
```

### Weak references

- 声明为 Optional

- 不能将常量定义为 weak
- 因为定义为 weak 的变量会在运行时被设置为 nil

```swift
class Tutorial {
	let title: String 
  weak var editor: Editor? // weak reference (optional) break the cycle
	init(title: String) { 
    self.title = title 
  }
	deinit { 
    print("Goodbye Tutorial \(title)!") 
  }
}
```

### Unowned references

- 总是期望有值
- 不能声明为 Optional

```swift
class Tutorial {
	let title: String 
  unowned let author: Author // unowned reference (非 optional)
  weak var editor: Editor?
	init(title: String, author: Author) { 
    self.title = title 
    self.author = author 
  } 
  deinit {
		print("Goodbye Tutorial \(title)!") 
  }
}

class Author {
	let name: String 
  var tutorials: [Tutorial] = []
	init(name: String) { 
    self.name = name 
  }
	deinit { 
    print("Goodbye Author \(name)!") 
  }
}

do { 
  let editor = Editor(name: "Ray") 
  let author = Author(name: "Cosmin") 
  let tutorial = Tutorial(title: "Memory management", author: author) 
  author.tutorials.append(tutorial) 
  tutorial.editor = editor 
  editor.tutorials.append(tutorial) 
}

// Goodbye Author Cosmin!
// Goodbye Tutorial Memory management! 
// Goodbye Editor Ray!
```

### Closures

- 闭包捕获了类的实例
- 此闭包又被赋值给了此类的属性

```swift
class Tutorial {
	let title: String 
  unowned let author: Author
  weak var editor: Editor?
  
  // strong reference cycle
  lazy var createDescription: () -> String = { 
    return "\(self.title) by \(self.author.name)" 
  }
  
	init(title: String, author: Author) { 
    self.title = title 
    self.author = author 
  } 
  deinit {
		print("Goodbye Tutorial \(title)!") 
  }
}
```

#### Capture lists

- 闭包捕获的变量列表
- 位于闭包参数之前的开始位置

```swift
var counter = 0
var f = { print(counter) } // 引用了变量 counter
counter = 1
f() // 1

counter = 0 
f = { [c = counter] in print(c) }
counter = 1 
f() // 0

// 可简写为:
counter = 0 
f = { [counter] in print(counter) } // 无需变量 c, counter 是一个 shadowed copy
counter = 1 
f()
```

```swift
class Tutorial {
	let title: String 
  unowned let author: Author
  weak var editor: Editor?
  
  //用捕捉列表打破循环引用
  lazy var createDescription: () -> String = { 
    [unowned self] in
    return "\(self.title) by \(self.author.name)" 
  }
  
	init(title: String, author: Author) { 
    self.title = title 
    self.author = author 
  } 
  deinit {
		print("Goodbye Tutorial \(title)!") 
  }
}
```

#### escaping closures

- 例如 filter 的 闭包，当 filter 完成后，此闭包不可访问，称为 `non-escaping`

- 异步代码用的闭包，为 `escaping closures` , 可能会造成循环引用
- 闭包默认是 `non-escaping` 的
- `escaping closure` 需要用 `@escaping` 修饰

#### GCD

```swift
func log(message: String) {
	let thread = Thread.current.isMainThread ? "Main" : "Background"
	print("\(thread) thread: \(message)")
}

func addNumbers(upTo range: Int) -> Int {
	log(message: "Adding numbers...")
	return (1...range).reduce(0, +)
}

let queue = DispatchQueue(label: "queue") // a serial queue

func execute<Result>(backgroundWork: @escaping () -> Result,  // 需要显示用 @escaping 修饰
                     mainWork: @escaping (Result) -> ()) { 
  // 因为 backgroundWork 和 backgroundWork 都在异步代码块里，被异步调用
  // 当 execute 函数执行结束后，闭包需要继续存在，被异步调用
  queue.async { 
    let result = backgroundWork()
    DispatchQueue.main.async { 
      mainWork(result) 
    }
  }
}

execute(backgroundWork: { addNumbers(upTo: 100) }, 
        mainWork: { log(message: "The sum is \($0)") })

// Background thread: Adding numbers... 
// Main thread: The sum is 5050
```

#### weak self

**有时不能捕获 self 作为 unowned, 因为 self 可能为 nil, 需用 weak**

```swift
extension Editor { 
  func feedback(for tutorial: Tutorial) -> String { 
    let tutorialStatus: String 
    // Should use the tutorial.content here, really. :] 
    // Instead, flip a coin 
    tutorialStatus = Bool.random() ? "published" : "rejected" 
    return "Tutorial \(tutorialStatus) by \(self.name)" 
  } 
  
  func editTutorial(_ tutorial: Tutorial) { 
    queue.async() { 
      [unowned self] in  // 虽然没用循环应用，但此代码不安全，因为在异步代码执行时，self 可能为 nil
      // The editor went out of scope before editTutorial had completed, self.feedback would crash when it eventually executed.
      let feedback = self.feedback(for: tutorial) 
      DispatchQueue.main.async { print(feedback) } 
    } 
  }
}
// 修改为:
extension Editor { 
  ...
  func editTutorial(_ tutorial: Tutorial) { 
    queue.async() { 
      [weak self] in // 使用 weak
      guard let self = self else { 
        print("I no longer exist so no feedback for you!") 
        return 
      } 
      DispatchQueue.main.async { 
        print(self.feedback(for: tutorial)) 
      }
    } 
  }
}
```

## 值类型和值语义

- 引用类型：assign-by-reference
- 值类型：assign-by-copy
- 值类型和引用类型的不同，其实是一种分配行为的不同
  - Value types and reference types differ in their assignment behavior.
- 值类型可以防止意外的改变，有助于线程安全

```swift
struct Color: CustomStringConvertible { 
  var red, green, blue: Double
	var description: String { 
    return "r: \(red) g: \(green) b: \(blue)"               
  }
}

// Preset colors 
extension Color { 
  static var black = Color(red: 0, green: 0, blue: 0) 
  static var white = Color(red: 1, green: 1, blue: 1) 
  static var blue = Color(red: 0, green: 0, blue: 1) 
  static var green = Color(red: 0, green: 1, blue: 0) // more ...
}

// Paint bucket abstraction 
class Bucket {
	var color: Color 
  var isRefilled = false
	init(color: Color) { 
    self.color = color 
  }
	func refill() { 
    isRefilled = true 
  }
}

let azurePaint = Bucket(color: .blue) 
let wallBluePaint = azurePaint 
wallBluePaint.isRefilled // => false, initially 
azurePaint.refill() 
wallBluePaint.isRefilled // => true, unsurprisingly!

extension Color { 
  mutating func darken() { 
    red *= 0.9; green *= 0.9; blue *= 0.9 
  } 
}

var azure = Color.blue 
var wallBlue = azure 
azure // r: 0.0 g: 0.0 b: 1.0 
wallBlue.darken() 
azure // r: 0.0 g: 0.0 b: 1.0 (unaffected)
```

### [值语义 (不是值类型)](https://academy.realm.io/cn/posts/swift-gallagher-value-semantics/)

- **A type has value semantics if the only way to affect a variable’s value is through that variable.**

- 一个具有值语义类型的变量，如果想要修改它只有一种方法，那就是通过变量本身进行修改；反过来如果只能通过变量本身修改值，那么这是一个具有值语义的变量
- 值语义可以保证变量值的独立性
- 修改一个变量永远不会影响其他值语义类型的变量
- 如果它完全不受其他变量的引用和修改的影响，那么它就是值语义类型（这不是指它不会影响其他变量，而是其他变量不会影响它）
- **值语义是关于接口，而值类型和引用类型是关于实现的**

- 值语义整体的好处是可以让你忘记实例的存在
- **不可变的引用类型具有值语义**
- **类型的访问权限也是和值语义有关的**
- One beneﬁt of value semantics is that they aid **local reasoning**, since to ﬁnd out how a variable got its value you **only need to consider the history of interactions with that variable**. The world of value semantics, is a simple one, where variables have values and those variables do not affect each other.
- 值语义适合惰性的，记叙性的数据，如数字，字符串，物理，数学，二进制等
- 引用语义适合具有区别性的个体，如按钮，内存buffer，屏幕坐标中的物体，真实世界中的物体等

```swift
// 检测一个类型是否是值语义的

var x = MysteryType() 
var y = x 
exposeValue(x) // => initial value derived from x 
// {code here which uses only y} // 这里的代码只能使用 y, 不能使用 x
exposeValue(x) // => final value derived from x 
// Q: are the initial and final values different? 
// 检测初始的 x 和 最终的 x 是否相等，若相等则是值语义的，否则不是
```

### 实现值语义

- 基本值类型，如 `Int`，自动支持值语义，因为其是 `assign-by-copy`
  - A primitive value type like Int always has value semantics.

- 复合值类型，如 `struct` , `enum`

  - 一个结构体支持值语义，则其所有存储属性支持值语义
    - If you deﬁne a struct type with properties, that type will have value semantics if all of its properties have value semantics.
  - 其他类型，如枚举，类似
    - Similarly, if you deﬁne an enum type with associated values, that type will have value semantics if all its associated values have value semantics.

- 引用类型

  - The type must be immutable, so the requirement is that all its properties are constant and must be of types that have value semantics.
  - 必须定义为不可变 (immutable)
  - 其所有存储属性为常量或支持值语义

  ```swift
  // UIImage 为不可变的 (immutable)，其属性 (scale, capInsets, renderingMode, etc.) 都是只读的
  var a = UIImage(named:"smile.jpg") 
  var b = a 
  computeValue(b) // => something 
  doSomething(a) 
  computeValue(b) // => same thing! // 是值语义的
  ```

- 值类型包含可变引用类型

  - 实现 `copy-on-write`
    - Choose the “value-semantics access level”, that is, the access level that’ll expose an interface that preserves value semantics.
    - Make note of all mutable reference-type properties, as these are the ones that spoil automatic value semantics. Set their access level below the value-semantics level.
    - Deﬁne all the setters and mutating functions at and above the value-semantics access level so that they never actually modify a shared instance of those referencetype properties, but instead assign a copy of the instance to the reference-type property.

  ```swift
  struct PaintingPlan // a value type, containing ... 
  { 
    var accent = Color.white // a value type
    var bucket = Bucket(color: .blue) // a mutable reference type 
  }
  
  let artPlan = PaintingPlan() 
  let housePlan = artPlan 
  artPlan.bucket.color // => blue 
  // for house-painting only we fill the bucket with green paint 
  housePlan.bucket.color = Color.green 
  artPlan.bucket.color // => green. oops!
  
  
  // 实现 copy-on-write 来解决
  struct PaintingPlan // a value type, containing ... 
  {
    var accent = Color.white // a value type
    private var bucket = Bucket() // a private reference type, for "deep storage" 
  	// a pseudo-value type, using the deep storage 
    var bucketColor: Color { 
      get { 
        return bucket.color 
      } 
      set { 
        bucket = Bucket(color: newValue) 
      } 
    }
  }
  
  // 进一步优化
  struct PaintingPlan // a value type, containing ... 
  { 
    // ... as above ...
  	// a computed property facade over deep storage 
    // with copy-on-write and in-place mutation when possible 
    var bucketColor: Color {
  		get { 
        return bucket.color 
      } 
      set { 
        // 用标准库函数 isKnownUniquelyReferenced 判断 bucket 是否在其他地方被引用
        if isKnownUniquelyReferenced(&bucket) { 
          bucket.color = bucketColor 
        } else { 
          bucket = Bucket(color: newValue) 
        } 
      }
  	}
  }
  ```

  - The Swift standard library uses this technique extensively.
  - In fact, many of the Swift value types are **not primitive value types**, but are **mixed types** that only seem like primitive value types because they provide **value semantics**, relying on efﬁcient **COW** implementations to do so. The Swift language itself relies on COW, sometimes deferring the copying of instances until the compiler can deduce that it is needed by a mutation.
  - WWDC 2016 session 207: What’s New in Foundation for Swift https://developer.apple.com/videos/play/wwdc2016/207/. Apple.
  - WWDC 2015 session 414: Building Better Apps with Value Types https://developer.apple.com/videos/play/wwdc2015/414/. Apple.
  - Controlling Complexity in Swift https://academy.realm.io/posts/andy-matuschak-controlling-complexity/ Andy Matuschak

  - Value of Values https://www.infoq.com/presentations/Value-Values. Rich Hickey
  - Purely Functional Data Structures

## 面向协议编程

- Protocol-oriented programming emphasizes **coding to protocols**, instead of to speciﬁc classes, structs or enums.
- **Extending protocols** is the key to an entirely new style of programming!

### Protocal extensions

- 协议扩展可以包含对于协议成员的实现

```swift
extension String { 
  func shout() { 
    print(uppercased()) 
  } 
}

"Swift is pretty cool".shout()


protocol TeamRecord { 
  var wins: Int { get } 
  var losses: Int { get } 
  var winningPercentage: Double { get } 
}

extension TeamRecord {
  var gamesPlayed: Int { // 计算属性
    return wins + losses 
  } 
}

struct BaseballRecord: TeamRecord { 
  var wins: Int 
  var losses: Int
	var winningPercentage: Double { 
    return Double(wins) / Double(wins + losses) 
  }
}
let sanFranciscoSwifts = BaseballRecord(wins: 10, losses: 5) 
sanFranciscoSwifts.gamesPlayed // 15
```

### Default implementation

- 协议扩展可以用于抽取大多数相同的属性实现作为默认实现
- 可极大的减少重复代码或样板代码
- 默认实现不会阻止实现协议类型进行自定义
- 协议本身有声明，协议扩展中再进行默认实现

```swift
struct BasketballRecord: TeamRecord { 
  var wins: Int 
  var losses: Int 
  let seasonLength = 82
  // winningPercentage 的实现与 BaseballRecord 相同
  // TeamRecord 的 winningPercentage 实现大多数可能都相同
	var winningPercentage: Double { 
    return Double(wins) / Double(wins + losses) 
  }
}

// 使用协议扩展用于默认实现
extension TeamRecord { 
  var winningPercentage: Double { 
    return Double(wins) / Double(wins + losses) 
  } 
}

struct BasketballRecord: TeamRecord { 
  var wins: Int 
  var losses: Int
  let seasonLength = 82
}
let minneapolisFunctors = BasketballRecord(wins: 60, losses: 22) 
minneapolisFunctors.winningPercentage

// 仍然可以自定义
struct HockeyRecord: TeamRecord { 
  var wins: Int 
  var losses: Int 
  var ties: Int
  
	// Hockey record introduces ties, and has 
  // its own implementation of winningPercentage 
  var winningPercentage: Double { // 自定义
    return Double(wins) / Double(wins + losses + ties) 
  }
}
let chicagoOptionals = BasketballRecord(wins: 10, losses: 6) 
let phoenixStridables = HockeyRecord(wins: 8, losses: 7, ties: 1)
chicagoOptionals.winningPercentage // 10 / (10 + 6) == 0.625 
phoenixStridables.winningPercentage // 8 / (8 + 7 + 1) == 0.5
```

### Static dispatching

- 协议扩展中定义而协议本身中未定义的属性或方法是**静态派发**，而非动态绑定，无多态
- 协议本身中定义了属性或方法而在协议扩展中只是进行了默认实现，则为**动态派发**

```swift
protocol WinLoss { 
  var wins: Int { get } 
  var losses: Int { get } 
}

extension WinLoss { 
  var winningPercentage: Double { // 静态派发
    return Double(wins) / Double(wins + losses) 
  } 
}

struct CricketRecord: WinLoss { 
  var wins: Int 
  var losses: Int 
  var draws: Int
	var winningPercentage: Double { 
    return Double(wins) / Double(wins + losses + draws) 
  }
}

let miamiTuples = CricketRecord(wins: 8, losses: 7, draws: 1) 
let winLoss: WinLoss = miamiTuples
miamiTuples.winningPercentage // 0.5 (8 / (8 + 7 + 1))
winLoss.winningPercentage // 0.53 !!! (8 / (8 + 7)) // WinLoss 中定义的 winningPercentage
```

### Type constraints

- By using a type constraint on a protocol extension, **you’re able to use methods and properties from another type** inside the implementation of your extension.

```swift
protocol PostSeasonEligible { 
  var minimumWinsForPlayoffs: Int { get } 
}
// 对实现了 TeamRecord 协议，同时实现了 PostSeasonEligible 协议的类型扩展属性
extension TeamRecord where Self: PostSeasonEligible { 
  var isPlayoffEligible: Bool { 
    return wins > minimumWinsForPlayoffs // 可使用 TeamRecord 和 PostSeasonEligible 中的属性
  } 
}
```

- Use type constraints to create default implementations on **speciﬁc type combinations**

```swift
struct HockeyRecord: TeamRecord { 
  var wins: Int 
  var losses: Int 
  var ties: Int
	var winningPercentage: Double { // 自定义的，但也会有很多与之相同的实现
    return Double(wins) / Double(wins + losses + ties) 
  }
}

// 使用类型约束来对另一些具体类型做默认实现
protocol Tieable { 
  var ties: Int { get } 
}
extension TeamRecord where Self: Tieable { 
  var winningPercentage: Double { 
    return Double(wins) / Double(wins + losses + ties) 
  } 
}
struct RugbyRecord: TeamRecord, Tieable { 
  var wins: Int 
  var losses: Int 
  var ties: Int 
}
let rugbyRecord = RugyRecord(wins: 8, losses: 7, ties: 1) 
rugbyRecord.winningPercentage // 0.5
```

### Protocol-oriented beneﬁts

- 使用 protocol 可以用于任何类型，对其做约束
- 使用 class, 之后将只能一直使用 class

```swift
class TeamRecordBase { 
  var wins = 0 
  var losses = 0
  var winningPercentage: Double { 
    return Double(wins) / Double(wins + losses) 
  }
}

// Will not compile: inheritance is only possible with classes. 
struct BaseballRecord: TeamRecordBase {
}
```

- 使用 class，要扩展时只能在子类中进行，或再增加一个子基类，增加了类继承的深度
- 使用 class，在扩展时需要关心具体的基类
- 使用 protocal，无需关心具体的类型
  - With protocols, you **don’t need to worry about the speciﬁc type or even whether the thing is a class or a struct**; all you care about is **the existence of certain common properties and methods**.

```swift
// add ties to the mix
class HockeyRecord: TeamRecordBase { 
  var ties = 0
	override var winningPercentage: Double { 
    return Double(wins) / Double(wins + losses + ties) 
  }
}

// or
class TieableRecordBase: TeamRecordBase { 
  var ties = 0
  override var winningPercentage: Double { 
    return Double(wins) / Double(wins + losses + ties) 
  }
}
class HockeyRecord: TieableRecordBase { }
class CricketRecord: TieableRecordBase { }

extension TieableRecordBase { 
  var totalPoints: Int { 
    return (2 * wins) + (1 * ties) 
  } 
}
```

- 协议允许一种多继承的形式
- When creating a type, you can **use protocols to decorate it** with **all the unique characteristics** you want

```swift
protocol TieableRecord { 
  var ties: Int { get } 
}

protocol DivisionalRecord { 
  var divisionalWins: Int { get } 
  var divisionalLosses: Int { get } 
}

protocol ScoreableRecord {
  var totalPoints: Int { get }

}

extension ScoreableRecord where Self: TieableRecord, Self: TeamRecord { 
  var totalPoints: Int { 
    return (2 * wins) + (1 * ties) 
  } 
}

struct NewHockeyRecord: TeamRecord, TieableRecord, DivisionalRecord, CustomStringConvertible, Equatable { 
  var wins: Int 
  var losses: Int 
  var ties: Int 
  var divisionalWins: Int 
  var divisionalLosses: Int
  var description: String { 
    return "\(wins) - \(losses) - \(ties)" 
  }
}
```

- With **a design centered around protocols** rather than speciﬁc classes, structs or enums, your code is instantly more **portable and decoupled** — methods now apply to a range of types instead of one speciﬁc type. Your code is also more **cohesive** because it operates only on the properties and methods within the protocol you’re extending and its type constraints. And it ignores the internal details of any type that conforms to it.
- Protocol-oriented programming gives you all of the advantages of typical object-oriented programming while dodging most of the pitfalls.