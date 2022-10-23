const express = require('express');
const yml = require('js-yaml')
const fs = require('fs')

const MainPage = require('./MainPage')
const AdminPanel = require('./AdminPanel')

function main() {
    data = yml.load(fs.readFileSync('config.yml'))

    console.log(data)

    const wanIP=data.wan
    const lanIP=yml.lan

    const wan = express()

    wan.use(MainPage, '/')
    wan.use(AdminPanel, '/adminpanel')

    

    wan.listen()
}
main();