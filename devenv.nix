{ pkgs, ... }:

{
  packages = [ pkgs.git ];

  # https://devenv.sh/languages/
  languages.nix.enable = true;
  languages.javascript.enable = true;
  languages.typescript.enable = true;
}
