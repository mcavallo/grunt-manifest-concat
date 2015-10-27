# grunt-manifest-concat

Manifest based script concatenation. Inspired by [Sprockets](https://github.com/sstephenson/sprockets#sprockets-directives).

## Getting Started

This plugin requires Grunt `^0.4.5`.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```
npm install grunt-manifest-concat --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```
grunt.loadNpmTasks('grunt-manifest-concat');
```

## Usage

### Setup

Add a section named `manifest` inside `grunt.initConfig` in your Gruntfile.

```
grunt.initConfig({
	manifest: {
		dist: {
			src: 'js',
			dest: 'build'
		}
	}
});
```

When this task is run It will search for `*.json` files inside the `src` directory, process those files and follow their directives to finally output the concatenated result to the `dest` directory.

### Manifest Files

This is the basic structure of a manifest file:

```
{
  "contents": [
    { "require_tree": "vendor" },
    { "require_directory": "lib/modules" },
    "lib/main.js",
    "lib/debug.js"
  ]
}
```

The directives are defined inside the `contents` array, where the `key` is the **directive type**, and the `value` is the **directive subject**.

### General Behaviour Notes

#### Paths

All paths are case sensitive and relative to the manifest file. It's possible to use absolute paths. URLs to remote resources are not supported.

#### Order

The order sprcified inside `contents` will be preserved, and while `require_directory` and `require_tree` take the files alphabethically It's possible to use mix the `require` if you need a specific file to be added first.

```json
{
  "contents": [
    "lib/modules/helpers.js",
    { "require_directory": "lib/modules/models" },
    { "require_tree": "lib/modules" }
  ]
}
```

#### Content Duplication

It was decided not to implement the [include directive](https://github.com/sstephenson/sprockets#the-include-directive) as [grunt-contrib-concat](https://github.com/gruntjs/grunt-contrib-concat) tasks will get rid of any duplicated files and keep each file once, the first time they appear.

#### Clashing Manifest Names

It's recommended to have unique names for manifests as they can overwrite each other during the output process.

## Options

Options can be set inside the task definition on the Gruntfile or can be added directly to the manifest files, for more granular control.

### sourceMap

Type: `Boolean` Default: `false`

Tells **grunt-contrib-concat** tasks to generate the sourceMap.

### banner

Type: `Boolean` Default: `false`

Tells **grunt-contrib-concat** tasks to include a banner. The banner cannot be customized and includes the name of the manifest as a single line comment.

```
// Manifest: js/vendor.json
```

### extension

Type: `String` Default: `"js"`

The extension dictates what type of files are found by the **require_directory** and **required_tree** directives and will also be used to construct the result file for each manifest `<manifest name>.<extension>`.


### cwd

Type: `String` Default: `""`

Gives the option of setting a shared base path for all contents. Only some directives can take advantage of this feature.

### dest

Type: `String` Default: `Read from Gruntfile`

It's possible to override the `dest` value for each individual manifest file by using this option. It can be a **directory** or a **file** with an extension matching the `extension` option.


## Available Directives

### require

Subject: `File` (`cwd` aware)

Inserts the contents of a file. If a file is required multiple times It will only appear once. It can be specified either by using a `string` that contains the path or by providing an `object`:

```
{
  "options": {
    "cwd": "vendor"
  },
  "contents": [
    "jquery.min.js",
    { "require": "jquery.history.js" }
  ]
}
```

### require_directory

Subject: `Directory`

Inserts the contents of all files inside the given path. Files are matched based by extension and are required in alphabethical order.

```
{
  "contents": [
    { "require_directory": "vendor/modules" }
  ]
}
```

### require_tree

Subject: `Directory`

Works like `require_directory` but It recursively search for files inside the given path.

```
{
  "contents": [
    { "require_tree": "vendor" }
  ]
}
```
