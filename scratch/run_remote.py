#!/usr/bin/expect -f

set timeout 60
spawn ssh root@192.168.183.35 "ls -la /var/www"
expect {
    "yes/no" { send "yes\r"; exp_continue }
    "assword:" { send "rJhj,rf2@\r" }
}
expect eof
