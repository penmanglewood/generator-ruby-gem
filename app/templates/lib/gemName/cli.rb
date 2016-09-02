require 'thor'
require '<%- gemName %>'

trap("SIGINT") { exit! }

module <%- moduleName %>
  class CLI < Thor
    include Thor::Actions

    map %w(-v --version) => :version

    # Example CLI command. Uncomment the following to set it in action:
    #
    # desc 'commandname [param1|param2]', 'command description' 
    # method_option :countries, :type => :array
    # def commandname(someParam)
    #   # Do things
    # end

    desc 'version', '<%- gemName %> version'
    def version
      puts <%- moduleName %>::VERSION
    end
  end
end
