<%- gemName %>
=================

<%- gemDescription %>

## Setup

1. Install `gem install <%- gemName %>`.

## Usage

_Fill in with gem usage information._

## Development

When hacking on this gem, the REPL `pry` comes in handy. You can load the
contents of the gem with `pry --gem`.
<% if (hasCLI) { %>
To test the CLI, run

    ruby -Ilib bin/<%- gemName %>
<% } %>
