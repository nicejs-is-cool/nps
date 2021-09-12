# nps 
This is a runner for npm scripts.
You can use arguments within npm scripts using this,
And also it is a quick way to run npm scripts.
### Usage
```
Usage:
nps <script> [arguments]
You can access arguments from the script using $<index> example:
If you run "nps hello world!"
And your script has:
echo "Hello $1"
It will output "Hello world!"
You can also use $* to get all the arguments.
```
### Compatibility
- [x] Windows
- [?] Linux
- [?] MacOS