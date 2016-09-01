# encoding: utf-8
require File.expand_path("../lib/<%- gemName %>/version", __FILE__)

Gem::Specification.new do |s|
    #Metadata
    s.name = "<%- gemName %>"
    s.version = <%- moduleName %>::VERSION
    s.authors = ["<%- authorName %>"]
    s.email = ["<%- authorEmail %>"]
    s.homepage = "<%- projectHomepage %>"
    s.summary = %q{<%- gemSummary %>}
    s.description = %q{<%- gemDescription %>}
    s.licenses = ['<%- license %>']
# If you want to show a post-install message, uncomment the following lines
#    s.post_install_message = <<-MSG
#
#MSG

    #Manifest
    s.files = `git ls-files`.split("\n")
    s.test_files = `git ls-files -- {test,spec,features}/*`.split("\n")
    s.executables = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
    s.require_paths = ['lib']

    <% if (hasCLI) { %>
    s.add_runtime_dependency 'thor', '~> 0.19'
    <% } %>
    <% if (hasTests) { %>
    s.add_development_dependency 'rspec', '~> 3'
    <% } %>
end
