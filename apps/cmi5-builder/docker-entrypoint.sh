#!/bin/sh
set -eu

case "${1:-}" in
  build|build-opendash|build-moodle)
    if [ "$#" -ge 3 ]; then
      output_dir=$3
      if [ ! -f "$output_dir/index.html" ]; then
        mkdir -p "$output_dir"
        cp -R /opt/cmi5/player/. "$output_dir/"
      fi
    fi
    ;;
esac

exec node /opt/cmi5/builder/main.js "$@"
