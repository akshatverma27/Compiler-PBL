import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req) {
    try {
        const { code } = await req.json();
        if (!code) {
            return Response.json({ error: 'No code provided.' }, { status: 400 });
        }

        const projectPath = 'd:\\mini-compiler';
        const filePath = path.join(projectPath, 'test.mc');

        // 1. Write the code to test.mc
        fs.writeFileSync(filePath, code);

        // 2. Execute the compiler via WSL
        // Using wsl because the compiler is built in a Linux environment (as per previous logs)
        const { stdout, stderr } = await execPromise(`wsl ./compiler test.mc`, { cwd: projectPath });

        // 3. Parse the compiler output
        const parsedData = parseCompilerOutput(stdout);

        // 4. Generate Lexer Token Stream natively in Node
        const tokens = tokenizeSource(code);
        parsedData.tokens = tokens;

        return Response.json({ 
            success: true, 
            output: stdout, 
            parsed: parsedData 
        });

    } catch (error) {
        return Response.json({ 
            success: false, 
            error: error.message,
            output: error.stdout || ''
        }, { status: 500 });
    }
}

function parseCompilerOutput(output) {
    const lines = output.split('\n');
    let phase = '';
    
    const astLines = [];
    const symbolTable = [];
    const tac = [];
    const assembly = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trimEnd();
        
        if (line.includes('--- Abstract Syntax Tree')) { phase = 'AST'; continue; }
        if (line.includes('--- Phase 3')) { phase = 'SEMANTIC'; continue; }
        if (line.includes('--- Symbol Table')) { phase = 'SYMBOL'; continue; }
        if (line.includes('--- Phase 4') || line.includes('--- Three Address')) { phase = 'TAC'; continue; }
        if (line.includes('--- Target Code')) { phase = 'ASSEMBLY'; continue; }
        if (line.includes('--------------------') || line.includes('--- Phase 5')) { phase = 'NONE'; continue; }
        if (line.trim() === '') continue;

        if (phase === 'AST') {
            astLines.push(line);
        }
        else if (phase === 'SYMBOL' && line.startsWith('Name:')) {
            // Name: a | Type: INT | Scope: 0 | Mem: 0
            const parts = line.split('|').map(p => p.trim());
            symbolTable.push({
                name: parts[0].split(': ')[1],
                type: parts[1].split(': ')[1],
                scope: parts[2].split(': ')[1],
                mem: parts[3].split(': ')[1],
            });
        }
        else if (phase === 'TAC') {
            if (!line.includes('---')) {
                tac.push(line.trim());
            }
        }
        else if (phase === 'ASSEMBLY') {
            if (!line.includes('---')) {
                assembly.push(line);
            }
        }
    }

    // Convert indented AST strings into React Flow Nodes/Edges
    const { nodes, edges } = parseAstToReactFlow(astLines);

    return {
        ast: { nodes, edges },
        symbolTable,
        tac,
        assembly
    };
}

function parseAstToReactFlow(astLines) {
    const nodes = [];
    const edges = [];
    let idCounter = 1;

    // Stack to keep track of parent nodes based on indentation level
    // Array of { node, indent }
    const stack = [];

    astLines.forEach((line) => {
        if (!line.trim()) return;
        
        const indent = line.search(/\S/); // find index of first non-whitespace character
        const label = line.trim();
        const nodeId = `node_${idCounter++}`;

        // React Flow node structure
        const newNode = {
            id: nodeId,
            data: { label },
            position: { x: 0, y: 0 }, 
            indent,
            style: { 
                background: '#161b22', 
                color: '#a78bfa', // text-violet-400
                border: '1px solid #8b5cf6', // border-violet-500
                borderRadius: '8px',
                padding: '10px 15px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
            }
        };

        // Pop elements from stack that have equal or greater indentation (not parents)
        while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        // If there's a parent, create an edge
        if (stack.length > 0) {
            const parent = stack[stack.length - 1].node;
            edges.push({
                id: `e_${parent.id}-${nodeId}`,
                source: parent.id,
                target: nodeId,
                animated: true,
                style: { stroke: '#8b5cf6', strokeWidth: 2 } // sleek purple edge
            });
        }

        nodes.push(newNode);
        stack.push({ node: newNode, indent });
    });

    // Auto layout (Basic X, Y assignment based on level and index)
    // A proper layout like dagre should be used on the frontend, but we can do a naive one here.
    const levelCounts = {};
    nodes.forEach(node => {
        const level = node.indent / 2; // Assuming 2 spaces per indent
        if (!levelCounts[level]) levelCounts[level] = 0;
        
        // Spread nodes horizontally based on how many are in this level
        node.position = {
            x: (levelCounts[level] * 200) + (level * 50), 
            y: level * 100
        };
        
        levelCounts[level]++;
        
        // Cleanup extra internal prop
        delete node.indent;
    });

    return { nodes, edges };
}

function tokenizeSource(code) {
    const tokens = [];
    const lines = code.split('\n');
    const tokenRegex = /\b(int|float|if|else|while|return)\b|\b([a-zA-Z_][a-zA-Z0-9_]*)\b|\b(\d+(?:\.\d+)?)\b|(==|!=|<=|>=|<|>|\+|-|\*|\/|=|;|,|\(|\)|\{|\})/g;
    
    for (let i = 0; i < lines.length; i++) {
        let match;
        // Reset regex state
        tokenRegex.lastIndex = 0;
        while ((match = tokenRegex.exec(lines[i])) !== null) {
            let type = 'UNKNOWN';
            if (match[1]) type = 'KEYWORD';
            else if (match[2]) type = 'IDENTIFIER';
            else if (match[3]) type = 'NUMBER';
            else if (match[4]) {
                const op = match[4];
                if ([';','{','}','(',')',','].includes(op)) type = 'PUNCTUATION';
                else type = 'OPERATOR';
            }
            
            tokens.push({
                id: tokens.length + 1,
                lexeme: match[0],
                type: type,
                line: i + 1,
                col: match.index + 1
            });
        }
    }
    return tokens;
}
