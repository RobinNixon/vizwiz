#!/usr/bin/env node

/**
 * VizWiz Visualizer Registration Utility
 * 
 * Usage: node add-visualizer.js <filename> <name> <author> [description]
 * Example: node add-visualizer.js "spiral.viz.js" "Spiral Galaxy" "Your Name" "Rotating spiral patterns"
 */

const fs = require('fs');
const path = require('path');

function addVisualizerToRegistry(filename, name, author, description = '') {
  const registryPath = path.join(__dirname, 'visualizers', 'registry.js');
  
  try {
    // Read the current registry
    let registryContent = fs.readFileSync(registryPath, 'utf8');
    
    // Extract the ID from filename (remove .viz.js)
    const id = filename.replace('.viz.js', '');
    
    // Create new visualizer entry
    const newEntry = `  {
    id: '${id}',
    name: '${name}',
    file: '${filename}',
    author: '${author}',
    description: '${description}'
  }`;
    
    // Find the closing bracket of the array
    const arrayEndIndex = registryContent.lastIndexOf(']');
    
    if (arrayEndIndex === -1) {
      throw new Error('Could not find array end in registry.js');
    }
    
    // Check if we need to add a comma
    const beforeArrayEnd = registryContent.substring(0, arrayEndIndex).trim();
    const needsComma = beforeArrayEnd.endsWith('}');
    
    // Insert the new entry
    const insertText = (needsComma ? ',\n' : '\n') + newEntry + '\n';
    const newContent = registryContent.substring(0, arrayEndIndex) + 
                      insertText + 
                      registryContent.substring(arrayEndIndex);
    
    // Write back to file
    fs.writeFileSync(registryPath, newContent, 'utf8');
    
    console.log(`✓ Added ${name} to visualizer registry`);
    console.log(`  File: ${filename}`);
    console.log(`  Author: ${author}`);
    console.log(`  Description: ${description}`);
    console.log(`\nNext steps:`);
    console.log(`1. Create the visualizer file: visualizers/${filename}`);
    console.log(`2. Refresh your browser to see the new visualizer`);
    
  } catch (error) {
    console.error('Error adding visualizer to registry:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: node add-visualizer.js <filename> <name> <author> [description]');
  console.log('Example: node add-visualizer.js "spiral.viz.js" "Spiral Galaxy" "Your Name" "Rotating spiral patterns"');
  process.exit(1);
}

const [filename, name, author, description = ''] = args;

// Validate filename
if (!filename.endsWith('.viz.js')) {
  console.error('Error: Filename must end with .viz.js');
  process.exit(1);
}

addVisualizerToRegistry(filename, name, author, description);