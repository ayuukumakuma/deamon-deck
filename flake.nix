{
  description = "Daemon Deck - macOS LaunchAgents GUI Manager";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "aarch64-darwin";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        nativeBuildInputs = [
          pkgs.rustup
          pkgs.bun
          pkgs.biome
          pkgs.pkg-config
        ];

        buildInputs = [
          pkgs.apple-sdk_15
          pkgs.libiconv
        ];

        shellHook = ''
          export PATH="$HOME/.cargo/bin:$PATH"
        '';
      };
    };
}
