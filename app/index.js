/* eslint-disable prefer-rest-params, max-len */

const fs = require('fs');
const yeoman = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const _ = require('lodash');
const mkdirp = require('mkdirp');

const licenses = [
  {
    name: 'Apache 2.0',
    path: 'licenses/Apache-2.0.txt',
  },
  {
    name: 'BSD 2',
    path: 'licenses/BSD-2-Clause-FreeBSD.txt',
  },
  {
    name: 'BSD 3',
    path: 'licenses/BSD-3-Clause.txt',
  },
  {
    name: 'ISC',
    path: 'licenses/ISC.txt',
  },
  {
    name: 'MIT',
    path: 'licenses/MIT.txt',
  },
  {
    name: 'No License (copyrighted)',
    path: 'licenses/nolicense.txt',
  },
  {
    name: 'Unlicense',
    path: 'licenses/unlicense.txt',
  },
];

function directoryExists(path) {
  try {
    const stats = fs.lstatSync(path);
    return stats.isDirectory();
  } catch (e) {
    return false;
  }
}

function directoryIsEmpty(path) {
  // It should return ['.', '..'], which is why 2 or less is considered empty
  return fs.readdirSync(path).length <= 2;
}

function kebabToCamel(str) {
  const camel = _.camelCase(str.replace(/-/g, ' '));
  if (camel.length > 0) {
    return camel[0].toUpperCase() + camel.slice(1);
  }

  return camel;
}

module.exports = yeoman.Base.extend({
  /* eslint-disable */
  constructor: function () {
    yeoman.Base.apply(this, arguments);

    this.argument('gemName', { type: String, required: false });
    this.gemName = _.kebabCase(this.gemName);
  },
  /* eslint-enable */

  prompting: {
    gatherGemInfo() {
      this.log(yosay(
        `Welcome to the ${chalk.red('Ruby gem')} generator!`
      ));

      const prompts = [
        {
          type: 'input',
          name: 'gemName',
          message: 'What is the name of your gem?',
          default: this.gemName,
          validate(input) {
            if (!input) {
              return 'The gem needs a name.';
            }

            return true;
          },
          filter(input) {
            return _.kebabCase(input);
          },
        },
        {
          type: 'input',
          name: 'authorName',
          message: 'What is the author\'s name?',
          validate(input) {
            if (!input) {
              return 'The author\'s name is required.';
            }

            return true;
          },
          default: this.user.git.name(),
        },
        {
          type: 'input',
          name: 'authorEmail',
          message: 'What is the author\'s email address?',
          validate(input) {
            if (!input) {
              return 'The author\'s email is required.';
            }

            return true;
          },
          default: this.user.git.email(),
        },
        {
          type: 'input',
          name: 'projectHomepage',
          message: 'What is the project\'s homepage?',
        },
        {
          type: 'input',
          name: 'gemSummary',
          message: 'Please provide a short summary:',
        },
        {
          type: 'input',
          name: 'gemDescription',
          message: 'Please provide a short description:',
        },
        {
          type: 'list',
          name: 'license',
          message: 'What\'s the license of your gem?',
          default: 'MIT',
          choices: licenses.map((l) => (l.name)),
        },
        {
          type: 'confirm',
          name: 'hasCLI',
          message: 'Does your gem have a CLI?',
          default: false,
        },
        {
          type: 'confirm',
          name: 'hasTests',
          message: 'You\'re going to write tests, right? Right??',
          default: true,
        },
      ];

      return this.prompt(prompts).then((props) => {
        this.gemDir = this.destinationPath(props.gemName);
        this.props = props;
      });
    },
    rubyModule() {
      return this.prompt({
        type: 'input',
        name: 'moduleName',
        message: 'What do you want to call the Ruby module?',
        default: kebabToCamel(this.props.gemName),
        validate(input) {
          if (!input) {
            return 'The Ruby module needs a name';
          }

          return true;
        },
        filter(input) {
          return kebabToCamel(input);
        },
      }).then((props) => {
        this.props.moduleName = props.moduleName;
      });
    },
    confirmDirectoryIsEmpty() {
      if (directoryExists(this.gemDir) && !directoryIsEmpty(this.gemDir)) {
        this.log(
          `The destination directory must be empty in order to continue:\n${chalk.red(this.gemDir)}\n`
        );
        process.exit();
      }
    },
  },

  configuring() {
    if (!directoryExists(this.gemDir)) {
      mkdirp(this.gemDir);
      this.destinationRoot(this.props.gemName);
    }
  },

  writing: {
    createDirectoryStructure() {
      mkdirp(this.destinationPath('lib', this.props.gemName));
    },

    gemspec() {
      this.fs.copyTpl(
        this.templatePath('default.gemspec'),
        this.destinationPath(`${this.props.gemName}.gemspec`),
        {
          gemName: this.props.gemName,
          moduleName: this.props.moduleName,
          authorName: this.props.authorName,
          authorEmail: this.props.authorEmail,
          projectHomepage: this.props.projectHomepage,
          gemSummary: this.props.gemSummary,
          gemDescription: this.props.gemDescription,
          license: this.props.license.name,
          hasCLI: this.props.hasCLI,
          hasTests: this.props.hasTests,
        }
      );
    },

    gemfile() {
      this.fs.copy(
        this.templatePath('Gemfile'),
        this.destinationPath('Gemfile')
      );
    },

    readme() {
      this.fs.copyTpl(
        this.templatePath('README.md'),
        this.destinationPath('README.md'),
        {
          gemName: this.props.gemName,
          gemDescription: this.props.gemDescription,
          hasCLI: this.props.hasCLI,
        }
      );
    },

    main() {
      this.fs.copyTpl(
        this.templatePath('lib', 'gemName.rb'),
        this.destinationPath('lib', `${this.props.gemName}.rb`),
        {
          gemName: this.props.gemName,
          moduleName: this.props.moduleName,
        }
      );

      this.fs.copyTpl(
        this.templatePath('lib', 'gemName', 'version.rb'),
        this.destinationPath('lib', this.props.gemName, 'version.rb'),
        {
          moduleName: this.props.moduleName,
        }
      );
    },

    license() {
      const licenseObj = licenses.find((e) => (e.name === this.props.license));

      this.fs.copyTpl(
        this.templatePath(licenseObj.path),
        this.destinationPath('LICENSE'),
        {
          year: new Date().getFullYear(),
          author: this.props.authorName,
        }
      );
    },

    cli() {
      if (this.props.hasCLI) {
        mkdirp(this.destinationPath('bin'));
        this.fs.copyTpl(
          this.templatePath('bin', 'gemName'),
          this.destinationPath('bin', this.props.gemName),
          {
            gemName: this.props.gemName,
            moduleName: this.props.moduleName,
          }
        );

        this.fs.copyTpl(
          this.templatePath('lib', 'gemName', 'cli.rb'),
          this.destinationPath('lib', this.props.gemName, 'cli.rb'),
          {
            gemName: this.props.gemName,
            moduleName: this.props.moduleName,
          }
        );
      }
    },

    rspec() {
      if (this.props.hasTests) {
        mkdirp(this.destinationPath('spec', this.props.gemName));
        this.fs.copyTpl(
          this.templatePath('spec', 'spec_helper.rb'),
          this.destinationPath('spec', 'spec_helper.rb'),
          {
            gemName: this.props.gemName,
          }
        );
      }
    },

    git() {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      );

      this.spawnCommandSync('git', ['init'], { cwd: this.destinationPath() });
    },
  },

  install() {
    // For some reason, Yeoman decides files without extensions are executable
    fs.chmodSync(
      this.destinationPath('LICENSE'),
      parseInt('0644', 8)
    );
  },

  end() {
    const msg = 'You\'re done!\nMake at least one commit, and when you\'re ready, run `bundle install`.\n\nHave fun hacking on your gem!';
    this.log(yosay(msg));
  },
});
