# Course HTML Templates

Use these HTML templates in the Course Content field when creating courses.

## Basic Course Template

```html
<h1>Welcome to the Course</h1>
<p>This is an introductory paragraph about your course.</p>

<h2>What You'll Learn</h2>
<ul>
  <li>Key concept 1</li>
  <li>Key concept 2</li>
  <li>Key concept 3</li>
</ul>

<h2>Course Overview</h2>
<p>Detailed description of what the course covers, including topics, structure, and learning outcomes.</p>

<h3>Prerequisites</h3>
<p>Any required knowledge or skills before taking this course.</p>
```

## Info Box Template

```html
<div class="bg-blue-500/10 border border-blue-500 rounded-lg p-4 my-4">
  <h3>Important Information</h3>
  <p>This is an info box for highlighting important details or notes.</p>
</div>
```

## Warning Box Template

```html
<div class="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 my-4">
  <h3>⚠️ Warning</h3>
  <p>Important warning or caution that students should be aware of.</p>
</div>
```

## Success/Tips Box Template

```html
<div class="bg-green-500/10 border border-green-500 rounded-lg p-4 my-4">
  <h3>💡 Pro Tip</h3>
  <p>Helpful tips or best practices for students.</p>
</div>
```

## Code Block Template

```html
<h3>Example Code</h3>
<pre><code>function example() {
  console.log("Hello World");
  return true;
}</code></pre>
```

## Quote Template

```html
<blockquote>
  <p>"This is an inspiring or important quote related to the course content."</p>
  <footer>— Author Name</footer>
</blockquote>
```

## Video Embed Template

```html
<h3>Video Lesson</h3>
<div class="my-4">
  <iframe 
    width="100%" 
    height="400" 
    src="https://www.youtube.com/embed/VIDEO_ID" 
    frameborder="0" 
    allowfullscreen
    class="rounded-lg"
  ></iframe>
</div>
```

## Image Template

```html
<h3>Visual Example</h3>
<img 
  src="https://example.com/image.jpg" 
  alt="Description of image"
  class="rounded-lg shadow-lg my-4 w-full"
/>
<p class="text-sm text-slate-400">Image caption or description</p>
```

## Full Course Example

```html
<h1>Cybersecurity Fundamentals</h1>

<div class="bg-blue-500/10 border border-blue-500 rounded-lg p-4 my-4">
  <h3>Course Overview</h3>
  <p>Learn the essential principles and practices of cybersecurity in this comprehensive course.</p>
</div>

<h2>Course Objectives</h2>
<ul>
  <li>Understand core security concepts and terminology</li>
  <li>Identify common threats and vulnerabilities</li>
  <li>Implement basic security controls and best practices</li>
  <li>Develop a security-focused mindset</li>
</ul>

<h2>Module 1: Introduction to Cybersecurity</h2>
<p>In this module, we'll explore the fundamentals of cybersecurity, including:</p>

<h3>What is Cybersecurity?</h3>
<p>Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information.</p>

<div class="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 my-4">
  <h3>⚠️ Key Point</h3>
  <p>Cybersecurity is not just about technology—it's about people, processes, and technology working together.</p>
</div>

<h3>The CIA Triad</h3>
<p>The three pillars of information security:</p>
<ul>
  <li><strong>Confidentiality</strong> - Ensuring information is accessible only to authorized users</li>
  <li><strong>Integrity</strong> - Maintaining the accuracy and completeness of data</li>
  <li><strong>Availability</strong> - Ensuring authorized users have access when needed</li>
</ul>

<h2>Hands-On Exercise</h2>
<div class="bg-green-500/10 border border-green-500 rounded-lg p-4 my-4">
  <h3>💡 Practice Activity</h3>
  <p>Complete the security assessment quiz in the next section to test your understanding.</p>
</div>

<h2>Additional Resources</h2>
<p>For further reading, check out these resources:</p>
<ul>
  <li><a href="#">NIST Cybersecurity Framework</a></li>
  <li><a href="#">OWASP Top 10</a></li>
  <li><a href="#">CIS Controls</a></li>
</ul>

<blockquote>
  <p>"The only truly secure system is one that is powered off, cast in a block of concrete and sealed in a lead-lined room with armed guards."</p>
  <footer>— Gene Spafford</footer>
</blockquote>
```

## Styling Reference

The course viewer supports these Tailwind CSS classes and responsive design:

### Available Colors
- `bg-blue-500/10` - Blue tinted backgrounds
- `bg-green-500/10` - Green tinted backgrounds  
- `bg-yellow-500/10` - Yellow tinted backgrounds
- `bg-red-500/10` - Red tinted backgrounds

### Border Colors
- `border-blue-500` - Blue borders
- `border-green-500` - Green borders
- `border-yellow-500` - Yellow borders
- `border-red-500` - Red borders

### Common Classes
- `rounded-lg` - Rounded corners
- `p-4` - Padding
- `my-4` - Vertical margin
- `shadow-lg` - Drop shadow
- `w-full` - Full width

## Tips for Writing Course Content

1. **Use Headings Hierarchically**: Start with `<h1>` for the main title, `<h2>` for sections, `<h3>` for subsections
2. **Break Up Text**: Use paragraphs, lists, and boxes to make content scannable
3. **Add Visual Interest**: Use info boxes, quotes, and images to break up text
4. **Include Examples**: Code blocks and real-world scenarios help understanding
5. **Use Semantic HTML**: `<strong>` for important text, `<em>` for emphasis, `<code>` for technical terms
6. **Test Your HTML**: Use the Preview button to see how your content will appear
7. **Keep it Accessible**: Use alt text for images, proper heading structure

## Quick Insert Buttons

The course builder includes quick insert buttons for:
- **H1, H2** - Headings
- **P** - Paragraphs
- **Bold, Italic** - Text formatting
- **List** - Bullet lists
- **Quote** - Blockquotes
- **Code** - Code snippets
- **Info Box** - Styled information boxes
- **Preview** - Toggle live preview

Click these buttons to insert HTML templates at your cursor position!
