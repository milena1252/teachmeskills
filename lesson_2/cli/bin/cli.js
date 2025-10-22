#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const pkg = require('../package.json');

const argv = process.argv.slice(2);
const [command, ...rest] = argv;

// Путь к конфигу в домашней директории
const CONFIG_PATH = path.join(os.homedir(), '.cli.json');

function loadConfig() {
    try {
        const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function saveConfig(cfg) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null,2), 'utf-8');
}

function printHelp() {
    console.log('Использование:');
    console.log('  hello <команда> [опции]\n');
    console.log('Команды:');
    console.log(' help                           Показать помощь');
    console.log(' init                           Создать или обновить конфиг');
    console.log(' greet [--name|-n]              Поздороваться');
    console.log(' add [a b c ...]                Сложить числа');
    console.log(' now                            Показать текущие дату и время');
    console.log(' version                        Показать версию CLI');
    console.log(' config get [ключ]              Показать конфиг или конкретное значение');
    console.log(' config set <ключ><значение>    Установить новое значение');
}

function parseFlags(args) {
    const flags = { _: [] };

    for(let i = 0; i < args.length; i++) {
        const a = args[i];

        if (a === '-n' || a === '--name') {
            flags.name = args[i+1];
            i++;
        } else if (a.startsWith('--name')) {
            flags.name = a.split('=')[1];
        } else if (a.startsWith('-')) {
            if(!flags.unknown) flags.unknown = [];
            flags.unknown.push(a);
        } else {
            flags._.push(a);
        }
    }
    return flags;
}

async function prompt(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise((resolve) => rl.question(question, resolve));
    rl.close();

    return answer;
}

async function main() {
    if(!command || command === 'help' || rest.includes('-h') || rest.includes('--help')) {
        return printHelp();
    }

    const flags = parseFlags(rest);
    if(flags.unknown && flags.unknown.length) {
        console.warn(`Предупреждение: неизвестные флаги ${flags.unknown.join(', ')}`);
    }

    const cfg = loadConfig();

    switch (command) {
        case 'version': {
            console.log(pkg.version);
            break;
        }

        case 'now': {
            console.log(new Date().toString());
            break;
        }

        case 'init': {
            let name = flags.name;
            if (!name) {
                name = await prompt('Как к вам обращаться?');
            }
            const next = { ...cfg, name };
            saveConfig(next);

            console.log(`Готово! Конфиг сохранен в ${CONFIG_PATH}`);
            break;
        }

        case 'greet': {
            const name = flags.name || cfg.name || 'пользователь';
            console.log(`Привет, ${name}!`);

            if(!cfg.name && !flags.name) {
                 console.log('Подсказка: сохраните имя командой init  hello init --name Иван');
            }
            break;
        }

        case 'add': {
            let nums = flags._.length ? flags._ : null;
            if (!nums) {
                const line = await prompt('Введите числа через пробел: ');
                nums = line.split(/\s+/).filter(Boolean);
            }
            const values = nums.map(Number);
            if(values.some(Number.isNaN)) {
                console.error('Ошибка: все аргументы должны быть числами');
                process.exitCode = 1;
                return;
            }
            
            const sum = values.reduce((a, b) => a + b, 0);
            console.log(`Сумма: ${sum}`);
            break;
        }

        case 'config': {
            const [sub, key, value] = flags._;
            const cfg = loadConfig();

            if (!sub || sub === 'get') {
                if (!key) {
                    console.log(JSON.stringify(cfg, null, 2));
                } else {
                    console.log(cfg[key]);
                }
            } else if (sub === 'set') {
                if (!key || typeof value === 'undefined') {
                    console.error('Использование: hello config set <ключ><значение>');
                    process.exitCode = 1;
                    return;
                }
                cfg[key] =value;
                saveConfig(cfg);
                console.log('Конфиг обновлен!');
            } else {
                //неизвестная подкоманда
                console.error(`Неизвестная подкоманда config: ${sub}`);
                process.exitCode = 1;
            }
            break;
        }

        default: {
            console.error(`Неизвестная команда: ${command}`);
            printHelp();
            process.exitCode = 1;
        }
    }
}

main().catch((e) => {
    console.error(e.stack || String(e));
    process.exitCode(1);
})