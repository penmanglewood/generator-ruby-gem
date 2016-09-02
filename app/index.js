'use strict';

var fs = require('fs');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var _ = require('lodash');
var mkdirp = require('mkdirp');

function directoryExists(path) {
  try {
    let stats = fs.lstatSync(path);
    return stats.isDirectory();
  } catch(e) {
    return false;
  }
}

function directoryIsEmpty(path) {
  // It should return ['.', '..'], which is why 2 or less is considered empty
  return fs.readdirSync(path).length <= 2;
}

function kebabToCamel(str) {
  var camel = _.camelCase(str.replace(/-/g, " "));
  if (camel.length > 0) {
    return camel[0].toUpperCase() + camel.slice(1);
  }

  return camel;
}

module.exports = yeoman.Base.extend({
  constructor: function() {
    yeoman.Base.apply(this, arguments);

    this.argument('gemName', {type: String, required: false});
    this.gemName = _.kebabCase(this.gemName);
  },

  prompting: {
    gatherGemInfo: function () {
      this.log(yosay(
        'Welcome to the ' + chalk.red('Ruby gem') + ' generator!'
      ));

      var prompts = [
        {
          type: 'input',
          name: 'gemName',
          message: 'What is the name of your gem?',
          default: this.gemName,
          validate: function(input) {
            if (!input) {
              return "The gem needs a name.";
            }

            return true;
          },
          filter: function(input) {
            return _.kebabCase(input);
          }
        },
        {
          type: 'input',
          name: 'authorName',
          message: 'What is the author\'s name?',
          validate: function(input) {
            if (!input) {
              return "The author's name is required.";
            }

            return true;
          },
          default: this.user.git.name()
        },
        {
          type: 'input',
          name: 'authorEmail',
          message: 'What is the author\'s email address?',
          validate: function(input) {
            if (!input) {
              return "The author's email is required.";
            }

            return true;
          },
          default: this.user.git.email()
        },
        {
          type: 'input',
          name: 'projectHomepage',
          message: 'What is the project\'s homepage?'
        },
        {
          type: 'input',
          name: 'gemSummary',
          message: 'Please provide a short summary:'
        },
        {
          type: 'input',
          name: 'gemDescription',
          message: 'Please provide a short description:'
        },
        {
          type: 'input',
          name: 'license',
          message: 'What\'s the license of your gem?',
          default: 'ISC'
        },
        {
          type: 'confirm',
          name: 'hasCLI',
          message: 'Does your gem have a CLI?',
          default: false
        },
        {
          type: 'confirm',
          name: 'hasTests',
          message: "You're going to write tests, right? Right??",
          default: true
        }
      ];

      return this.prompt(prompts).then(function (props) {
        this.gemDir = this.destinationPath(props.gemName);
        this.props = props;
      }.bind(this));
    },
    rubyModule: function() {
      return this.prompt({
        type: 'input',
        name: 'moduleName',
        message: 'What do you want to call the Ruby module?',
        default: kebabToCamel(this.props.gemName),
        validate: function(input) {
          if (!input) {
            return "The Ruby module needs a name";
          }

          return true;
        },
        filter: function(input) {
          return kebabToCamel(input);
        }
      }).then(function (props) {
        this.props.moduleName = props.moduleName;
      }.bind(this));
    },
    confirmDirectoryIsEmpty: function() {
      if (directoryExists(this.gemDir) && !directoryIsEmpty(this.gemDir)) {
        this.log(
          "The destination directory must be empty in order to continue:" + "\n" +
            chalk.red(this.gemDir) + "\n"
        );
        process.exit();
      }
    }
  },

  configuring: function() {
    if (!directoryExists(this.gemDir)) {
      mkdirp(this.gemDir);
      this.destinationRoot(this.props.gemName);
    }
  },

  writing: {
    createDirectoryStructure: function() {
      mkdirp(this.destinationPath("lib", this.props.gemName));
    },

    gemspec: function() {
      this.fs.copyTpl(
        this.templatePath('default.gemspec'),
        this.destinationPath(this.props.gemName + '.gemspec'),
        {
          gemName: this.props.gemName,
          moduleName: this.props.moduleName,
          authorName: this.props.authorName,
          authorEmail: this.props.authorEmail,
          projectHomepage: this.props.projectHomepage,
          gemSummary: this.props.gemSummary,
          gemDescription: this.props.gemDescription,
          license: this.props.license,
          hasCLI: this.props.hasCLI,
          hasTests: this.props.hasTests
        }
      );
    },

    gemfile: function() {
      this.fs.copy(
        this.templatePath('Gemfile'),
        this.destinationPath('Gemfile')
      );
    },

    readme: function() {
      this.fs.copyTpl(
        this.templatePath('README.md'),
        this.destinationPath('README.md'),
        {
          gemName: this.props.gemName,
          gemDescription: this.props.gemDescription,
          hasCLI: this.props.hasCLI
        }
      );
    },

    main: function() {
      this.fs.copyTpl(
        this.templatePath('lib', 'gemName.rb'),
        this.destinationPath('lib', this.props.gemName + '.rb'),
        {
          gemName: this.props.gemName,
          moduleName: this.props.moduleName
        }
      );

      this.fs.copyTpl(
        this.templatePath('lib', 'gemName', 'version.rb'),
        this.destinationPath('lib', this.props.gemName,  'version.rb'),
        {
          moduleName: this.props.moduleName
        }
      );
    },

    cli: function() {
      if (this.props.hasCLI) {
        mkdirp(this.destinationPath("bin"));
        this.fs.copyTpl(
          this.templatePath('bin', 'gemName'),
          this.destinationPath('bin', this.props.gemName),
          {
            gemName: this.props.gemName,
            moduleName: this.props.moduleName
          }
        );

        this.fs.copyTpl(
          this.templatePath('lib', 'gemName', 'cli.rb'),
          this.destinationPath('lib', this.props.gemName, 'cli.rb'),
          {
            gemName: this.props.gemName,
            moduleName: this.props.moduleName
          }
        );
      }
    },

    rspec: function() {
      if (this.props.hasTests) {
        mkdirp(this.destinationPath("spec", this.props.gemName));
        this.fs.copyTpl(
          this.templatePath('spec', 'spec_helper.rb'),
          this.destinationPath('spec', 'spec_helper.rb'),
          {
            gemName: this.props.gemName
          }
        );
      }
    },

    git: function() {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      );

      this.spawnCommandSync("git", ["init"], { cwd: this.destinationPath() });
    }
  },

  install: function() {
    if (this.props.hasCLI) {
      fs.chmodSync(
        this.destinationPath("bin", this.props.gemName),
        parseInt('0755', 8)
      );
    }
  },

  end: function() {
    this.log(yosay(
      "You're done!" + "\n" +
        "Make at least one commit, and when you're ready, run `bundle install`." + "\n\n" +
        "Have fun hacking on your gem!"
    ));
  }
});
