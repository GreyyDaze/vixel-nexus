# Go Basics — For a Product Engineer Who Already Knows Code

---

## What is Go? (The Language)

**Go is a programming language** — just like Python, JavaScript, or C#. You write code in it. That's all.

| Language | What you write | Where it runs |
|---|---|---|
| Python | `def hello():` | Server |
| TypeScript | `const hello = () =>` | Browser + Server |
| C# | `string Hello()` | Server |
| **Go** | `func Hello() string` | Server |

It is **only for backend**. It does not run in the browser. You write API endpoints in it — same as writing Django views, Express routes, or ASP.NET endpoints. Just different words.

```
Django:    def get_canaries(request): return Canary.objects.all()
ASP.NET:   app.MapGet("/canaries", (db) => db.Canaries.ToList())
Go:        mux.HandleFunc("GET /canaries", handleGetCanaries)

Same job. Different language.
```

---

## What is the Go Toolchain? (The Compiler + Runtime)

**The Go toolchain is what builds and runs Go code** — like Node.js runs JavaScript, .NET runs C#, or Python runs .py files.

| Your code | Gets built & run by | Like |
|---|---|---|
| `index.ts` | Node.js | Runtime |
| `app.py` | Python | Runtime |
| `Program.cs` | .NET | Runtime + Compiler |
| `main.go` | **Go toolchain** | Compiler + Runtime |

**You must install Go on your computer to run Go code.** One command:

```bash
brew install go
```

After installing, you run your code with: `go run .` (same as `dotnet run`, `npm run dev`, or `python app.py`)

### Key difference from Python/JS/C#:

Go **compiles** your code into a standalone binary before running it. There's no separate runtime you need to install on the server — you just copy the binary.

```
go build ./cmd/server   →  produces a file called "server"
./server                →  runs it, no Go installation needed
```

**Same machine, same OS** → copy the binary, run it. No dependencies, no runtime install.

---

## Go vs the Go Toolchain — The Difference

```
Go             = the language  (what you write — the syntax)
Go toolchain   = the compiler  (builds your code into a binary)

Like:
C#             = the language (what you write)
.NET           = the runtime + compiler (what builds + runs your code)
```

You write `main.go` in Go. `go run .` compiles and runs it.

---

## How Go Runs Your Code (Very Simple)

```
You type: go run ./cmd/server
              ↓
Go reads your .go files (your source code)
              ↓
Go compiles them into a single machine-code binary (in /tmp)
              ↓
Go runs that binary
              ↓
Your API starts on http://localhost:8080
              ↓
Browser hits GET / → Go runs your handler → returns HTML/JSON
```

Alternatively, build once and run anywhere:

```
go build -o server ./cmd/server   →  produces "server" binary
./server                           →  runs it directly, no Go needed
```

It's a **server process** that stays running and waits for requests — exactly like `python manage.py runserver` or `dotnet run`.

---

## What "Statically Typed" Means

Same as C# and TypeScript. You must write the **type** of every variable. It can't change later.

```go
var name string = "Aminah"
name = 42        // ❌ Error! Can't put a number in a string
```

Unlike Python:
```python
name = "Aminah"
name = 42  # ✅ Works fine (but can cause bugs)
```

Same idea as C#/TypeScript — catches bugs before you run. Go is strict — no `any` escape hatch.

---

## What "Compiled to a Binary" Means

When you `go build`, Go creates a **single file** that contains everything your program needs. No separate runtime. No package manager. No `node_modules`.

```
go build ./cmd/server
    ↓
server  (a single ~15MB file)
    ↓
Copy it to any Linux/Mac machine → ./server → it just works
```

| Language | How you ship |
|---|---|
| Python | Need Python + requirements.txt + pip install on server |
| Node.js | Need Node.js + node_modules + npm install on server |
| C#/.NET | Need .NET runtime on server (or self-contained publish) |
| **Go** | **Copy one file. Run it. Done.** |

---

## Does Go Have Frameworks?

**Not really — and that's intentional.** Go's standard library has everything you need for web servers, JSON, templates, and databases. Many Go projects use zero third-party frameworks.

| Language | Web framework | Database framework |
|---|---|---|
| Python | Django | Django ORM |
| TypeScript | Express / Next.js | Prisma |
| C# | ASP.NET Core | Entity Framework Core |
| **Go** | **`net/http` (stdlib)** | **`database/sql` (stdlib) or a lightweight query builder** |

In this project (Vixel Nexus), the only external dependency is:
- `github.com/a-h/templ` — a type-safe HTML template engine (replaces Go's built-in `html/template` for better DX)

The web framework? **Zero.** Go's `net/http` + `http.ServeMux` handles everything.

```
Go's stdlib = Node.js built-in http module + fs + path + json all in one
           = .NET's BCL (Base Class Library)
```

You get HTTP server, JSON parsing, routing, file serving, templating, testing, encryption — all built in.

---

## 1. Project Structure — Where Is Frontend, Backend, Database?

In a Django project you have:

```
my-project/
├── manage.py              # Entry point
├── requirements.txt       # Dependencies
├── myapp/
│   ├── models.py          # Database models
│   ├── views.py           # API logic
│   └── templates/         # HTML
└── db.sqlite3             # Database file
```

In an ASP.NET project:

```
my-app/
├── Program.cs              # Entry point
├── my-app.csproj           # Project file
├── Models/                 # Database models
├── Data/AppDbContext.cs    # Database config
└── wwwroot/                # Frontend HTML
```

In a Go project it's the same idea:

```
vixel-nexus/
├── go.mod                  # Like package.json + .csproj combined
├── go.sum                  # Like package-lock.json (checksums)
├── cmd/
│   └── server/
│       └── main.go         # Entry point (like Program.cs + manage.py)
├── internal/
│   ├── handlers/
│   │   └── handlers.go     # API logic (like views.py)
│   ├── models/
│   │   └── transaction.go  # Data structures (like models.py)
│   └── components/
│       ├── dashboard.templ  # HTML templates
│       ├── layout.templ
│       └── transactions.templ
├── static/
│   ├── test-merchant.html  # Frontend HTML
│   └── js/
│       └── nexus.js        # Frontend JS
└── scripts/
    └── nexus.ts            # TypeScript source (compiled to nexus.js)
```

### Where is the backend?

**In `cmd/server/main.go`** — this is your entire server entry point. It contains:
- Server setup
- Route registration
- Static file serving

```go
// cmd/server/main.go = Program.cs + app startup + route registration
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", handlers.HandleDashboard)
    mux.HandleFunc("/transactions", handlers.HandleTransactions)
    mux.Handle("/static/", http.StripPrefix("/static/", fileServer))
    http.ListenAndServe(":8080", mux)
}
```

### Where is the data logic?

**In `internal/handlers/handlers.go`** — your request handlers (like views.py or Program.cs routes):

```go
// handlers.go = views.py / Program.cs route handlers
func HandleDashboard(w http.ResponseWriter, r *http.Request) {
    // Build data, render template, write response
    templ.Handler(components.Dashboard(health, transactions)).ServeHTTP(w, r)
}
```

### Where is the data?

**In `internal/models/`** — your struct definitions (like Django models or C# model classes):

```go
// transaction.go = models.py / Models/Transaction.cs
type Transaction struct {
    ID        string
    Amount    float64
    Currency  string
    Status    TransactionStatus
    Merchant  string
    CreatedAt time.Time
}
```

Note: this project has **no database**. It generates fake data in memory. If there were a database, models would be the same structs — Go has no ORM by default.

### Where is the frontend?

**In `static/` folder** — served as static files by the Go server. Any file in `static/` is accessible at `/static/...`.

```html
<!-- static/test-merchant.html = the frontend -->
<!-- It loads nexus.js and uses the <nexus-checkout> web component -->
<nexus-checkout data-amount="149.00" data-currency="USD"></nexus-checkout>
<script src="/static/js/nexus.js"></script>
```

### How Frontend, Backend, and Data Connect

```
Browser                          Go Server                    In-Memory Data
   │                                │                             │
   │  ┌─────────────────────┐       │                             │
   │  │ Dashboard (/)        │       │                             │
   │  │ (loaded in browser)  │       │                             │
   │  │                      │       │                             │
   │  │ HTMX polls every 10s │       │                             │
   │  │ hx-get="/transactions"       │                             │
   │  └─────────┬───────────┘       │                             │
   │            │                    │                             │
   │            │  GET /transactions │                             │
   │            ├──────────────────►│                             │
   │            │                    │  NewTransaction()           │
   │            │                    │  (generates random data)    │
   │            │                    │                             │
   │            │  Response (HTML    │                             │
   │            │  <tr> fragment)    │                             │
   │            │◄──────────────────┤                             │
   │            │                    │                             │
   │            │  New row appears   │                             │
   │            │  in transaction    │                             │
   │            │  table             │                             │
```

**Same flow as Django/ASP.NET:**
```
Django:   Browser → views.py → models.py → SQLite → Response → Browser
ASP.NET:  Browser → Program.cs → Models → SQLite → Response → Browser
Go:       Browser → handlers.go → models → (memory) → Response → Browser
```

### The complete file structure

```
vixel-nexus/
├── go.mod                       # Dependencies (like package.json + .csproj)
├── go.sum                       # Checksums (like package-lock.json)
├── cmd/server/main.go           # Entry point: server setup + routes
├── internal/
│   ├── handlers/handlers.go     # API logic (route handlers)
│   ├── models/transaction.go    # Data structures (structs)
│   └── components/
│       ├── dashboard.templ      # HTML templates
│       ├── layout.templ
│       └── transactions.templ
└── static/
    ├── test-merchant.html       # Frontend HTML page
    └── js/nexus.js              # Frontend JavaScript
```

**~10 files total.** That's all you need.

### Create a new Go project:

```bash
mkdir my-project && cd my-project
go mod init my-project          # Creates go.mod (like npm init)
touch main.go                   # Create your entry point
go run .                        # Run it
```

This is equivalent to `dotnet new webapi` or `npm init && npm run dev`.

### Summary

| Component | Django | ASP.NET | Go | Where file is |
|---|---|---|---|---|
| Entry point | `manage.py` | `Program.cs` | `cmd/server/main.go` | `cmd/server/` |
| Dependencies | `requirements.txt` | `.csproj` | `go.mod` | Root folder |
| Data models | `models.py` | `Models/*.cs` | `internal/models/*.go` | `internal/models/` |
| API logic | `views.py` | `Program.cs` routes | `internal/handlers/*.go` | `internal/handlers/` |
| Templates | `templates/*.html` | `wwwroot/` or Razor | `internal/components/*.templ` | `internal/components/` |
| Frontend HTML | `templates/*.html` | `wwwroot/index.html` | `static/*.html` | `static/` |

---

## 2. All Go Data Types (Cheat Sheet)

These are the types you will actually use. Ignore the rest.

### Numbers

```go
var count int = 42              // Whole number: depends on platform (use this 90%)
var big int64 = 9999999999      // Big whole number (use when int might be too small)
var price float64 = 29.99       // Decimal number (use for money, percentages)
```

**Rule:** Use `int` for IDs, counts, ages. Use `float64` for prices. Never use the others.

### Text

```go
var name string = "Aminah"      // Text (use this for everything text)
var letter byte = 'A'           // Single character (rarely needed)
```

**Rule:** Use `string` for everything text. That's it.

### True/False

```go
var isActive bool = true        // true or false
var isCompromised bool = false
```

**Rule:** Same as boolean in any language.

### Date & Time

```go
var now time.Time = time.Now()                 // Current date + time
var specific time.Time = time.Date(2026, 6, 10, 0, 0, 0, 0, time.UTC)  // June 10, 2026
```

**Rule:** Use `time.Time` for dates.

### Slices (Arrays)

```go
var names []string                     // Empty slice of strings (nil, ready to append)
names := []string{"Alice", "Bob"}      // Slice with values
```

**Rule:** Use `[]T` for arrays. Works like `string[]` in TypeScript, `List<T>` in C#.

### Pointers (The Go Quirk — Like Nullable Types in C#)

A pointer variable can hold a value OR nothing (`nil`). Write `*` before the type to say "this is a pointer."

```go
var age *int                         // Pointer to an int — can be nil
age = nil                            // ✅ OK. No value yet

var createdAt time.Time              // NOT a pointer — must always have a value
```

**When to use pointers:** When a value starts as nil and gets set later (same as `?` in C#).
- `CreatedAt` = always set when object is created → NOT a pointer
- A field that's optional → pointer

Unlike C# where you write `DateTime?`, Go uses `*time.Time` for optional/nullable values.

### Quick Summary

| Type | Example | Like in C# | Like in TypeScript |
|---|---|---|---|
| `int` | `var age int = 25` | `int` | `number` |
| `int64` | `var id int64 = 999` | `long` | `number` (big) |
| `float64` | `var price = 1.99` | `double` | `number` |
| `string` | `var name = "A"` | `string` | `string` |
| `bool` | `var ok = true` | `bool` | `boolean` |
| `time.Time` | `time.Now()` | `DateTime` | `Date` |
| `[]string` | `[]string{"a"}` | `List<string>` | `string[]` |
| `*int` | `var age *int` | `int?` | `number \| null` |

**For this project, you only need these types:**

```
int         → IDs, counts
string      → names, statuses, merchant names
float64     → amounts
bool        → flags (rarely needed)
time.Time   → CreatedAt timestamps
[]T         → slices (lists of transactions)
```

---

## 3. Variables & Types (With `:=` Shorthand)

Go has two ways to declare variables.

### Full Declaration (Type Before Name — Like C#)

```go
var name string = "Aminah"
var age int = 25
var price float64 = 29.99
var isActive bool = true
var now time.Time = time.Now()
```

### Short Declaration `:=` (Go's `var`)

`:=` is a shortcut. The compiler figures out the type for you.

```go
name := "Aminah"           // Compiler knows: this is a string
age := 25                  // Compiler knows: this is an int
price := 29.99             // Compiler knows: this is a float64
```

It works the same as writing the type. Both lines below do the same thing:

```go
var name string = "Aminah" // You write the type
name := "Aminah"           // Compiler figures it out
```

**When to use `:=` vs `var`:**

```
Use := :    name := "Aminah"           // Shorter, preferred for most cases
Use := :    tx := NewTransaction()     // Type is obvious from function
Use var:    var price float64 = 1.99   // When you want to be explicit about the type
```

**For this project, use `:=` almost always.** It's the Go convention.

### About `var` with No Initial Value

```go
var count int        // count = 0 (Go auto-sets to zero — no null errors)
var name string      // name = "" (empty string — no null errors)
var active bool      // active = false
```

Unlike C# where uninitialized variables are errors, Go gives every variable a **zero value**. You can't have an uninitialized variable. This prevents a whole class of bugs.

---

## 4. Slices (Like Lists/Arrays)

A slice holds multiple items of the same type. This is Go's version of C#'s `List<T>` or TypeScript's `string[]`.

### Create a Slice

```go
// Empty slice — ready to append
var names []string

// Slice with items already inside
names := []string{"Alice", "Bob", "Charlie"}

// Slice with initial capacity (optional optimization)
names := make([]string, 0, 10)  // Empty, but pre-allocated space for 10
```

### Add and Remove Items

```go
names := []string{}

names = append(names, "Alice")       // ["Alice"]
names = append(names, "Bob")         // ["Alice", "Bob"]
names = append(names, "Charlie")     // ["Alice", "Bob", "Charlie"]

// Remove: slice the two parts together (no built-in remove)
names = append(names[:1], names[2:]...)  // ["Alice", "Charlie"]
```

**Important:** `append` returns a **new slice**. You must assign it back: `names = append(names, "Alice")`.

### Get Items

```go
names := []string{"Alice", "Bob", "Charlie"}

names[0]        // "Alice"   (first item, index 0)
names[1]        // "Bob"     (second item, index 1)
len(names)      // 3         (how many items, like .Count in C# or .length in JS)
```

### Loop Through a Slice

```go
names := []string{"Alice", "Bob", "Charlie"}

// Method 1: for range (most common, use this)
for _, name := range names {
    fmt.Println(name)
}
// Prints: Alice Bob Charlie

// Method 2: for loop with index (use when you need the position)
for i := 0; i < len(names); i++ {
    fmt.Printf("%d: %s\n", i, names[i])
}
// Prints: 0: Alice  1: Bob  2: Charlie
```

**Note:** Go's `for range` gives you TWO values: the index and the value. If you don't need the index, use `_` to ignore it:
```go
for _, name := range names { ... }   // Ignore index
for i, name := range names { ... }   // Use both
```

### Slice of Your Own Objects

```go
type Transaction struct {
    ID     string
    Amount float64
}

var transactions []Transaction

transactions = append(transactions, Transaction{
    ID:     "ABC123",
    Amount: 149.99,
})

// Loop through them
for _, t := range transactions {
    fmt.Println(t.ID)
}
```

### Summary: Slice vs C# List vs TypeScript Array

| Action | Go | C# | TypeScript |
|---|---|---|---|
| Create empty | `var s []string` | `new List<string>()` | `[]` |
| Create with items | `[]string{"a", "b"}` | `new List<string> { "a", "b" }` | `["a", "b"]` |
| Add item | `s = append(s, "a")` | `.Add("a")` | `.push("a")` |
| Remove item | `append(s[:i], s[i+1:]...)` | `.Remove("a")` | `.filter(x => x !== "a")` |
| Get by index | `s[0]` | `list[0]` | `list[0]` |
| Length | `len(s)` | `.Count` | `.length` |
| Loop | `for _, x := range s` | `foreach (var x in list)` | `for (const x of list)` |

---

## 5. Structs (Your Models — Go's Version of Classes)

Go doesn't have classes. It has **structs** — they're the same thing, just a different word.

A **struct** is a blueprint for an object. You define the blueprint once, then create many objects from it.

### Think of It Like This

```
Struct = a form with empty fields
         ┌──────────────────────────────┐
         │  Transaction                  │
         │  ─────────────────────       │
         │  ID: ______                  │
         │  Amount: ______              │
         │  Currency: ______            │
         │  Status: ______              │
         │  Merchant: ______            │
         │  CreatedAt: now              │
         └──────────────────────────────┘

Object = a filled form
         ┌──────────────────────────────┐
         │  Transaction                  │
         │  ─────────────────────       │
         │  ID: "6B7D4A438"            │
         │  Amount: 991.40              │
         │  Currency: "USD"            │
         │  Status: "Refunded"         │
         │  Merchant: "Nebula Systems"  │
         │  CreatedAt: "2026-06-13"    │
         └──────────────────────────────┘
```

### Define a Struct

```go
type Transaction struct {
    ID        string
    Amount    float64
    Currency  string
    Status    TransactionStatus
    Merchant  string
    CreatedAt time.Time
}
```

Each line is called a **field**.
- `ID` = the field name (PascalCase — exported/public)
- `string` = the type (what kind of data)

### Keywords on a Struct Explained

Every word before a field has a meaning.

| Keyword | What it means | Where it goes |
|---|---|---|
| `type` | "I'm defining a new type" | Before the struct name |
| `struct` | "This is a collection of fields" | After the struct name |
| `func` | "I'm defining a function" | Before function name |
| `return` | "Give this value back" | Inside a function body |

```go
type Transaction struct {     // type = "I'm defining a new type"
    ID     string              //     struct = "I'm a collection of fields"
    Amount float64
}
```

### Upper Case vs Lower Case — Public vs Private

In Go, **capital letter = public**, **lower case = private**.

```go
type Transaction struct {
    ID     string    // Public — anyone can read/write (starts with capital)
    secret string    // Private — only this package can see (starts with lower)
}
```

For this project: **everything is upper case** (public). You don't need private fields.

### Create Objects from a Struct

```go
// Method 1: Create empty, then fill
var t Transaction
t.ID = "ABC123"
t.Amount = 149.99

// Method 2: Fill at creation time (shorter, use this)
t := Transaction{
    ID:     "ABC123",
    Amount: 149.99,
}

// Method 3: When adding to a slice
transactions = append(transactions, Transaction{
    ID:     "ABC123",
    Amount: 149.99,
})
```

All three do the same thing. Use Method 2 or 3.

### Use Fields

```go
t := Transaction{ID: "ABC123", Amount: 149.99}

// Read
fmt.Println(t.ID)       // "ABC123"

// Write
t.Status = "Refunded"

// Use in a string
fmt.Printf("Transaction %s: $%.2f", t.ID, t.Amount)
// Prints: "Transaction ABC123: $149.99"
```

### Struct with Constant Values (Enum Pattern)

Go doesn't have enums. Use `const` + `iota` + a custom type:

```go
type TransactionStatus string

const (
    StatusCaptured TransactionStatus = "Captured"
    StatusRefunded TransactionStatus = "Refunded"
    StatusPending  TransactionStatus = "Pending"
    StatusFailed   TransactionStatus = "Failed"
)
```

Then use it in your struct:

```go
type Transaction struct {
    Status TransactionStatus
}

t := Transaction{Status: StatusCaptured}
```

### How Structs Compare to C# Classes

| Concept | Go | C# |
|---|---|---|
| Blueprint | `type X struct { }` | `class X { }` |
| Field | `Name string` | `public string Name { get; set; }` |
| Create | `X{Name: "a"}` | `new X { Name = "a" }` |
| Public | Capital letter: `Name` | `public` keyword |
| Private | Lower case: `name` | `private` keyword |
| Enum | `type X string` + `const` | `enum X { }` |

### Two Structs for This Project

```go
type Transaction struct {
    ID        string
    Amount    float64
    Currency  string
    Status    TransactionStatus
    Merchant  string
    CreatedAt time.Time
}

type IntegrityHealth struct {
    Uptime       float64
    FraudRate    float64
    ResponseTime int
}
```

---

## 6. Naming Conventions in Go

Go has ONE naming style. Much simpler than C#.

| Style | What it looks like | Used for |
|---|---|---|
| **PascalCase** | `Transaction`, `GetStatus`, `CreatedAt` | Exported (public) names: types, functions, fields |
| **camelCase** | `transaction`, `getStatus`, `createdAt` | Unexported (private) names |

But unlike C# which uses PascalCase for methods AND camelCase for variables:

**Go uses camelCase for EVERYTHING that's not exported.** Variables, parameters, internal functions — all camelCase.

```go
// PascalCase — Exported (public)
type Transaction struct {       // Type is public
    ID string                   // Field is public
}
func NewTransaction() Transaction { ... }  // Function is public

// camelCase — Unexported (private)
var transactionIds []string     // Variable is private
func parseAmount(s string) float64 { ... } // Function is private
```

### Go vs C# vs TypeScript

| Thing | Go | C# | TypeScript |
|---|---|---|---|
| Type/struct name | `Transaction` | `Transaction` | `Transaction` |
| Function name | `NewTransaction` | `NewTransaction` | `newTransaction` |
| Field/property | `CreatedAt` | `CreatedAt` | `createdAt` |
| Variable (public) | N/A (no concept) | `CreatedAt` | N/A |
| Variable (any) | `transaction` | `transaction` | `transaction` |
| Parameter | `tx` or `t` (short) | `transaction` | `transaction` |

### Go Convention: Short Variable Names

Go prefers **short** variable names — especially for parameters and local variables.

```go
// Go style (short — idiomatic)
func HandleDashboard(w http.ResponseWriter, r *http.Request) {
    t := NewTransaction()
    transactions = append(transactions, t)
}

// C# style (long — would look odd in Go)
func HandleDashboard(writer http.ResponseWriter, request *http.Request) {
    newTransaction := NewTransaction()
    allTransactions = append(allTransactions, newTransaction)
}
```

**Common Go short names:**

```
w       → http.ResponseWriter
r       → *http.Request
err     → error
db      → database connection
t, tx   → transaction
c       → config, canary, etc.
i, j    → loop indexes
```

### Quick Rules for This Project

```
Types:          Transaction, IntegrityHealth, TransactionStatus  (PascalCase)
Fields:         ID, Amount, Currency, Status, Merchant,         (PascalCase)
                CreatedAt, Uptime, FraudRate, ResponseTime

Functions:      NewTransaction, HandleDashboard,                (PascalCase)
                HandleTransactions, HandleHealth

Variables:      t, tx, health, transactions, mux, port,        (camelCase, short)
                merchants, statuses, fileServer

Parameters:     w, r, stats, transactions                       (camelCase, short)
```

**The one rule to remember:** If it's a type/function that other packages need to use → PascalCase. If it's a variable or internal function → camelCase. Keep variable names short.

---

## 7. Functions (Methods)

### Basic Function

```go
// ── Function that returns something ──
func GetStatus(status TransactionStatus) string {
    if status == StatusCaptured {
        return "✅ Captured"
    } else {
        return "❌ Failed"
    }
}

// ── Function that returns nothing ──
func LogMessage(message string) {
    fmt.Println("[LOG]", message)
}

// ── Named return value (Go-specific) ──
func SplitAmount(amount float64) (dollars int, cents int) {
    dollars = int(amount)
    cents = int((amount - float64(dollars)) * 100)
    return  // "naked return" — returns dollars, cents automatically
}

// ── TypeScript equivalent ──
// const getStatus = (status: TransactionStatus): string => {
//   return status === "Captured" ? "✅ Captured" : "❌ Failed"
// }

// ── C# equivalent ──
// public string GetStatus(TransactionStatus status) {
//     return status == StatusCaptured ? "✅ Captured" : "❌ Failed";
// }
```

### Multiple Return Values (Go's Superpower)

Go functions can return **multiple values**. This is used constantly for error handling.

```go
// Common pattern: return (result, error)
func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("cannot divide by zero")
    }
    return a / b, nil
}

// Caller checks the error
result, err := Divide(10, 0)
if err != nil {
    fmt.Println("Error:", err)
}
```

**Every function that can fail** returns an error as the last return value. You always check it.

### Function as a Method (on a struct)

```go
type Transaction struct {
    ID     string
    Amount float64
}

// This is a "method" — a function that belongs to Transaction
func (t Transaction) Display() string {
    return fmt.Sprintf("#%s: $%.2f", t.ID, t.Amount)
}

// Use it:
t := Transaction{ID: "ABC", Amount: 149.99}
fmt.Println(t.Display())   // Prints: #ABC: $149.99
```

Same as C# methods on a class. The `(t Transaction)` before the function name is called the **receiver** — it's like `this` in C#/JS.

### Function vs Method — Quick Comparison

| | Go | C# |
|---|---|---|
| Free function | `func Hello() { }` | `public void Hello() { }` (static) |
| Method on type | `func (t T) Hello() { }` | `public void Hello() { }` (instance method) |
| Call method | `t.Hello()` | `t.Hello()` |
| Receiver/this | `func (t T) Hello()` — `t` is the receiver | `public void Hello()` — `this` is implicit |

---

## 8. `fmt.Println` and `fmt.Printf` — Printing to the Terminal

`fmt.Println()` prints text to the terminal. Use it to check values while building.

### Print Simple Text

```go
fmt.Println("Hello")              // Prints: Hello
fmt.Println("Transaction created") // Prints: Transaction created
```

Same as `Console.WriteLine("Hello")` in C#, `print("Hello")` in Python, or `console.log("Hello")` in JS.

### Print a Variable

```go
name := "ssh-key-1"
fmt.Println(name)                 // Prints: ssh-key-1

count := 42
fmt.Println(count)                // Prints: 42
```

### Print Text + Variable Together

Use `fmt.Printf` with format verbs:

```go
name := "ssh-key-1"
fmt.Printf("Canary %s was created\n", name)
// Prints: Canary ssh-key-1 was created
```

Format verbs (like `%s`, `%d`, `%f`) are placeholders:

| Verb | What it prints | Example |
|---|---|---|
| `%s` | string | `"hello"` |
| `%d` | int | `42` |
| `%f` | float | `3.140000` |
| `%.2f` | float with 2 decimals | `3.14` |
| `%v` | "value" — any type, default format | `{ID: "ABC"}` |
| `%+v` | struct with field names | `{ID:ABC Amount:149.99}` |
| `\n` | newline | — |

```go
name := "ssh-key-1"
count := 3
price := 149.99

fmt.Printf("Canary: %s, Count: %d, Price: $%.2f\n", name, count, price)
// Prints: Canary: ssh-key-1, Count: 3, Price: $149.99
```

### Same in Other Languages

```go
// Go (use this):
fmt.Printf("Status: %s, Count: %d\n", status, count)

// C#:
// Console.WriteLine($"Status: {status}, Count: {count}")

// Python:
// print(f"Status: {status}, Count: {count}")

// JavaScript:
// console.log(`Status: ${status}, Count: ${count}`)
```

Go doesn't have string interpolation with `$""` like C#. Use `fmt.Printf` or `fmt.Sprintf` instead.

### Where Println Goes

In a web API, `fmt.Println` prints to the terminal where you ran `go run .`, not to the browser. Use it for debugging:

```
Terminal:
> go run ./cmd/server
Nexus Orchestrator active at http://localhost:8080
--- Dashboard: http://localhost:8080
--- Test Merchant: http://localhost:8080/static/test-merchant.html
```

---

## 9. `net/http` — How the Server Starts

Go's standard library `net/http` handles everything. No Express, no ASP.NET — it's all built in.

### The 3 Lines You Always Write

```go
mux := http.NewServeMux()             // 1. Create a router (like app in ASP.NET)
mux.HandleFunc("/", handler)          // 2. Register routes
http.ListenAndServe(":8080", mux)     // 3. Start the server
```

Think of it like:

```
mux := http.NewServeMux()
    ↑
"Hey Go, create a request router"

mux.HandleFunc("/", handler)
    ↑
"When someone visits /, call this function"

http.ListenAndServe(":8080", mux)
    ↑
"Start the server on port 8080. Listen forever."
```

### Full Pattern

```go
func main() {
    mux := http.NewServeMux()              // Get ready

    // ── Your routes go here ──
    mux.HandleFunc("/", handleHome)
    mux.HandleFunc("/api/transactions", handleTransactions)

    // ── Static files ──
    fileServer := http.FileServer(http.Dir("./static"))
    mux.Handle("/static/", http.StripPrefix("/static/", fileServer))

    http.ListenAndServe(":8080", mux)     // Start
}
```

### How Route Handlers Work — Request and Response

Each route handler takes TWO parameters: the **request** (what the browser sent) and the **response writer** (where you write your reply).

```go
// Every route handler has this exact signature:
func handler(w http.ResponseWriter, r *http.Request) {
    // w = "write your response here"
    // r = "info about what the browser requested"
}
```

**Same idea in other frameworks:**

```python
# Django
def get_canaries(request):           # request = what browser sent
    return HttpResponse("...")       # return = response

# ASP.NET
app.MapGet("/canaries", (db) => {    # parameters = auto-injected
    return Results.Ok(data)          # return = response
});

# Go
func handleGetCanaries(w http.ResponseWriter, r *http.Request) {
    // w = where you write the response
    // r = what the browser sent
    fmt.Fprint(w, "...")             // w.Write = send response
}
```

### The Two Ways to Send a Response

```go
// 1. Write text/HTML directly
func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "<h1>Hello</h1>")       // w is a writer — write to it
}

// 2. Set status codes
func handler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusNotFound)    // 404
    fmt.Fprint(w, "Not found")
}
```

### How Routing Works

```go
mux := http.NewServeMux()

// Exact match
mux.HandleFunc("/", handler)              // matches only "/"

// Prefix match (note: no trailing slash)
mux.Handle("/static/", handler)           // matches "/static/..." anything
```

### How This Compares to ASP.NET Minimal API

```go
// ── Go ──
mux := http.NewServeMux()
mux.HandleFunc("GET /transactions", handleTransactions)
mux.HandleFunc("POST /transactions", handleCreateTransaction)
http.ListenAndServe(":8080", mux)

// ── C# Minimal API ──
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.MapGet("/transactions", (db) => { ... });
app.MapPost("/transactions", (db, t) => { ... });
app.Run();

// ── Same structure, different words ──
```

---

## 10. Templ — How Templates Work in This Project

This project uses `a-h/templ` instead of Go's built-in `html/template`. It's a **type-safe HTML template engine**.

### What Templ Does

You write templates in `.templ` files (looks like HTML + Go):

```go
// components/hello.templ
package components

templ Hello(name string) {
    <div class="greeting">
        <h1>Hello, { name }!</h1>
    </div>
}
```

Templ generates Go code from these files. You never edit the `_templ.go` files — they're auto-generated.

### How You Use Templ in Go Code

```go
// In your handler:
func HandleDashboard(w http.ResponseWriter, r *http.Request) {
    templ.Handler(components.Hello("World")).ServeHTTP(w, r)
    //               ↑                          ↑
    //         Templ component            Convert to HTTP response
}
```

### Templ vs C# Razor

| Concept | Templ (Go) | Razor (C#) |
|---|---|---|
| File extension | `.templ` | `.cshtml` |
| Code blocks | `{ expression }` | `@expression` |
| Generated file | `*_templ.go` | Compiled into assembly |
| Type safety | Yes — Go compiler catches errors | Yes — C# compiler catches errors |
| Layout | `@Layout("Title") { children... }` | `@layout _Layout.cshtml` |

### Templ Components in This Project

```
Layout(title string)                  → The HTML shell (head, sidebar, main area)
Dashboard(stats, transactions)        → The dashboard page content
StatCard(label, value, trend, up)     → A single stat card
TransactionTable(transactions)        → A full HTML table
TransactionRow(transaction)           → A single table row
```

They nest like this:

```
Layout
  └── Dashboard
        ├── StatCard
        ├── StatCard
        ├── StatCard
        └── TransactionTable
              └── TransactionRow (repeated)
```

Same nesting pattern as React components or Razor partials.

---

## 11. This Project's Complete `main.go` (Walkthrough)

This is the full backend entry point. Read it like a story.

### Part 1: Setup

```go
func main() {
    mux := http.NewServeMux()     // "Create a new router"
```

### Part 2: Route 1 — Dashboard

```go
    mux.HandleFunc("/", handlers.HandleDashboard)
    // When someone visits /, render the full dashboard page
```

### Part 3: Route 2 — Transactions (HTMX Fragment)

```go
    mux.HandleFunc("/transactions", handlers.HandleTransactions)
    // When HTMX polls for new data, return a single <tr> row
    // (1 in 20 times, returns 500 to simulate failure)
```

### Part 4: Route 3 — Health Check

```go
    mux.HandleFunc("/health", handlers.HandleHealth)
    // Simple ping endpoint — returns 200 OK
```

### Part 5: Static Files

```go
    fileServer := http.FileServer(http.Dir("./static"))
    mux.Handle("/static/", http.StripPrefix("/static/", fileServer))
    // Serves files from ./static/ at /static/...
    // /static/js/nexus.js → ./static/js/nexus.js
    // /static/test-merchant.html → ./static/test-merchant.html
```

### Part 6: Start

```go
    http.ListenAndServe(":8080", mux)
    // "Start the server. Listen on http://localhost:8080"
}
```

### The 4 Routes in One Picture

```
GET  /                              → Full dashboard page
GET  /transactions                  → New transaction row (HTMX fragment)
GET  /health                        → Health check (200 OK)
GET  /static/...                    → Static files (JS, HTML)
```

### Handlers and Models (in separate files)

```go
// internal/handlers/handlers.go
func HandleDashboard(w http.ResponseWriter, r *http.Request) {
    health := models.IntegrityHealth{...}
    transactions := []models.Transaction{...}
    templ.Handler(components.Dashboard(health, transactions)).ServeHTTP(w, r)
}

func HandleTransactions(w http.ResponseWriter, r *http.Request) {
    t := NewTransaction()
    templ.Handler(components.TransactionRow(t)).ServeHTTP(w, r)
}

// internal/models/transaction.go
type TransactionStatus string
const ( StatusCaptured = "Captured" StatusFailed = "Failed" ... )

type Transaction struct {
    ID, Currency, Merchant  string
    Amount                  float64
    Status                  TransactionStatus
    CreatedAt               time.Time
}

type IntegrityHealth struct {
    Uptime       float64
    FraudRate    float64
    ResponseTime int
}
```

---

## 12. Commands You Need

```bash
# Run the project (starts on http://localhost:8080)
go run ./cmd/server

# Build a binary (produces a single file called "server")
go build -o server ./cmd/server
./server

# Add a dependency
go get github.com/a-h/templ

# Tidy dependencies (cleans up go.mod + go.sum)
go mod tidy

# Generate templ code (after editing .templ files)
templ generate

# That's it. You only need these commands.
```

### Create a new Go project:

```bash
mkdir my-project && cd my-project
go mod init my-project          # Creates go.mod
touch main.go                   # Create main.go
go run .                        # Run it
# Then add your routes, handlers, models, etc.
```

---

## Quick Reference: Go vs C# vs TypeScript vs Python

| Concept | Go | C# | TypeScript | Python |
|---|---|---|---|---|
| Variable | `var x = "A"` or `x := "A"` | `string x = "A"` or `var x = "A"` | `let x: string = "A"` | `x = "A"` |
| Slice/List | `[]string{"a"}` | `new List<string>{"a"}` | `string[] = ["a"]` | `["a"]` |
| Add to list | `s = append(s, "a")` | `.Add("a")` | `.push("a")` | `.append("a")` |
| Loop | `for _, x := range s` | `foreach (var x in s)` | `for (const x of s)` | `for x in s` |
| Function | `func Fn(x int) string {}` | `string Fn(int x) {}` | `const fn = (x: number): string => {}` | `def fn(x):` |
| Null | `nil` | `null` | `null / undefined` | `None` |
| Object | `T{Name: "x"}` | `new T { Name = "x" }` | `{ name: "x" }` | `{"name": "x"}` |
| Print | `fmt.Println(x)` | `Console.WriteLine(x)` | `console.log(x)` | `print(x)` |
| Format | `fmt.Printf("%s", x)` | `$"Hello {x}"` | `` `Hello ${x}` `` | `f"Hello {x}"` |

---

## What You DON'T Need to Learn (Skip These)

| Advanced concept | Why skip |
|---|---|
| Goroutines and channels | This project is single-threaded. You don't need concurrency yet. |
| Interfaces | You don't need them for simple CRUD or this type of project. |
| Pointers beyond `*T` | You'll use `&` and `*` rarely. Just know that `*T` = "nullable T". |
| `context.Context` | Not needed for simple handlers. Ignore it. |
| `defer` | Useful but optional for this project size. |
| `go` keyword (goroutines) | Not needed — this project has no concurrent work. |
| Generics (type parameters) | Useful but you can avoid them in small projects. |
| Error wrapping (`%w`) | `errors.New` and `fmt.Errorf` are enough. |
| Reflection | Never needed in normal code. |
| Build tags, CGo, assembly | Never needed. |
| Dependency injection | Go doesn't have it. You just pass things as parameters. |
