#!/usr/bin/expect -f
set timeout 60
set ip "192.168.183.35"
set user "root"
set password "rJhj,rf2@"
set cmd [lindex $argv 0]

spawn ssh -o StrictHostKeyChecking=no $user@$ip $cmd
expect {
    "*password:" {
        send "$password\r"
        exp_continue
    }
    "*yes/no*" {
        send "yes\r"
        exp_continue
    }
    eof
}
