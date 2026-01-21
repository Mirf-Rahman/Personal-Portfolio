export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Portfolio API</h1>
      <p>This is the backend API for the Personal Portfolio.</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li><code>GET /api/health</code> - Health check</li>
        <li><code>GET /api/skills</code> - List skills</li>
        <li><code>GET /api/projects</code> - List projects</li>
        <li><code>GET /api/experience</code> - List work experience</li>
        <li><code>GET /api/education</code> - List education</li>
        <li><code>GET /api/hobbies</code> - List hobbies</li>
        <li><code>GET /api/testimonials</code> - List approved testimonials</li>
        <li><code>POST /api/contact</code> - Submit contact message</li>
        <li><code>POST /api/testimonials</code> - Submit testimonial</li>
        <li><code>GET /api/resume</code> - Get resume info</li>
      </ul>
    </main>
  );
}
