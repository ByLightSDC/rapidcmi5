# Primitive Data Types

- In programming, data type is an attribute of data which tells the compiler or interpreter how the programmer intends to use the data.


- Python has many data types. Each of these types behave and do different things.


- There are builtin functions to convert from one type to another. (We will cover this later)


- If the source type cannot be converted to the target type, Python will show a TypeError.


- Broadly, these data types can be classified as Numbers, Strings, and Objects (more specifically, Sequence and Mapping types).

## Integers

- Numbers can be an Integer called an int.


- In Python, integers are defined as type int.


- Numbers 1,2,3 and 4…​ etc are integers. An integer is any whole number with no decimal or fractional value.


- Python3 does not limit the maximum value of an integer, it is unbounded. Unbounded is a mathematical term for functions and values that have no maximum value.


- The size of the integer is limited to the size of the registers/memory allocated to the integer within the operating system.

```python
x = 5 
y = 4
z = -1
```

## Floating Point

- Floating point (decimal) called a float.


- Floating point numbers, that is those numbers with decimal point places, are defined as float.


- A floating point number precision is dependent on the system architecture.


- Precision refers to the accuracy at which small numbers can be measured. The greater the precision the more decimal places can be represented by a value.

```python
a = 2.0 
b = 3.5
a = 1.1567
```

### What can we do with numbers

#### Other Base Types
- When working with integers, it may be convenient to encode literal values in bases other than decimal.

```python
x = 10

bin(10)
#'0b1010'
oct(10)
#'0o12'
hex(10)
#'0xa'
print(type(x))
#<class 'int'>

```


| Base       | Value          | Decimal Value |
| ---------- | -------------- | --------------|
|Hexadecimal | ```x = 0xff``` |     255       | 
| Octal      | ```y = 0o77``` |      63       |
| Binary     | ```z = 0b111```|     7         |



#### Numerical Operations 

| Operation |               Result              |
| --------- | ----------------------------------|
| x + y     | Sum of x and y                    |
| x - y     | difference of X and Y             |
| x * y     | Product of X and Y                |
| x / y     | Quotient of x and Y               |
| x // y    | Floored Quotient of X and Y       |
| x % y     | Remainder of x / y                |
| -x        | x negated                         |
| +x        | x unchanged                       |
| abs(x)    | Absolute Value(or magnitude of x) |
| int(x)    | X Converted to integer            |
| float(x)  | x Converted to floating point     |


- The = (equal sign) does not test if the two sides are equal, but sets the left hand side to refer to the right hand side.

- Python supports three distinct numeric data types.

- Integers, Floating Point Numbers, and Complex Numbers.

- Python’s numerical operations are shown below, sorted by ascending priority.

## Boolean

- The bool data type is named after Boolean values. In short, a bool data type can hold only the values 0 or 1.


- This can be thought of as a way to express True [1] or False [0]. For example, the bool value of 0 represents False.
- Any value of a variable other than 0 will result to True in Bool
    - example: x = 5; bool(x) >>> True
    - example: x = 0; bool(x) >>> False

			
```python
#And Truth Table:
#Output:
print(True and True)			True
print(True and False)			False
print(False and True)			False
print(False and False)			False
```

- Python supplies keywords to express True and False, these are unsurprisingly, True and False.


- The case is important.


- Both must start with a capital letter.


- Also make note that there are no quotation marks around True or False.



## String

- A string is a sequence of characters (upper and lowercase alphabetical characters, numbers, or special characters) surrounded by quotes.

- A string may also be referred to as a string literal.

- Recall that a literal is a basic value.

- This is raw data that cannot be changed once initialized.	

- Python will recognize this data type as str for string.

- A Python expert would describe strings as an “immutable sequence of zero or more characters.”

- Immutable means that strings cannot be changed once created.

- However, a variable referring to a string can be made to refer to a different string at another time in code

```python
print("this is a string")
```
### Literal Strings

- Literal string values may be enclosed in single ‘ ‘ or double quotes “ “.


- Since strings are a sequence of characters, the built-in len function can be used to determine the number of characters the string contains.


- Literal strings can span multiple lines in several ways.


- Using the line continuation character \ as the last character.


- Literal strings may also be prefixed with a letter r or R.


- These are referred to as raw strings and use different rules for backslash escape sequences.


- If a programmer needs a special character in a string, the programmer may need to use an escape sequence.


- The following is a list of the escape sequences that can be used in literal strings to represent special characters.

### Character Meanings

| Sequence | Character/Meaning |
| :------- | ---------------- :|
| \newline | Line Continuation |
| \\       | Backslash         |
| \'       | single Quote      |
| \"       | Double Quote      |
| \a       | ASCII Bell(BEL)   |
| \b       | Backspace         |
| \f       | Form Feed         |
| \n       | Line feed         |
| \r       | Carriage Return   |
| \t       | Horizontal Tab    |
| \v       | Vertical Tab      |
| \ooo     | ASCCI Character (octal value ooo)|
| \xhhh    | ASCCI Character (hex value hhh) |
| \uxxxx   | Unicode Character with 16-bit hex value xxxx |
| \Uxxxxxxxx| Unicode Character with 32-bit hex value xxxxxxxx | 

```python 

#Input:									output:
print("this is a 'single quote' inside a double quote")	#this is a 'single quote' inside a double quote

print('this is a \'single quote\' inside a single quote')	#this is a 'single quote' inside a single quote

print('this is a \"double quote\" inside a single quote')	#this is a "double quote" inside a single quote

print('this is a \t tab')						#this is a   	tab

print('this is a \n newline')					#this is a
#newline

```

## List 
- Mutable sequence of items (not necessarily of hte same type)
- Creating a list:
  - list()
  - []
 
```python
li = []
li2 = list()
li3 = ["string", 2, 5.0, True]
```

## Tuple
- immutable sequence of items
- Creating a tuple: 
  - tuple()
  - ()

``` python
    tup = tuple()
    tup2 = ()
    tup3 = (1, "string", 3.0)

```


## None Type 

- Another data type in Python is the NoneType which can be represented by using the None keyword.

- None is similar to null in other languages. In Python, None means nothing and will evaluate to False in a conditional statement.

- None is often used to check the result of some action or to ensure a variable has a value and is not nothing
