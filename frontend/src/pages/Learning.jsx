import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Learning() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrollmentId, setEnrollmentId] = useState(null);

  useEffect(() => {
    // Fetch course details
    fetch(`${API_BASE_URL}/courses/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data);
        if (data.sections && data.sections.length > 0 && data.sections[0].lessons.length > 0) {
          setActiveLesson(data.sections[0].lessons[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // Check enrollment
    fetch(`${API_BASE_URL}/enrollments/?course=${id}`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEnrollmentId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  const toggleLessonComplete = (lessonId) => {
    const nextCompleted = new Set(completedLessons);
    if (nextCompleted.has(lessonId)) {
      nextCompleted.delete(lessonId);
    } else {
      nextCompleted.add(lessonId);
    }
    setCompletedLessons(nextCompleted);

    // Calculate total lessons & updated progress percentage
    let totalLessonsCount = 0;
    course?.sections?.forEach((sec) => {
      totalLessonsCount += sec.lessons ? sec.lessons.length : 0;
    });

    if (totalLessonsCount > 0 && enrollmentId) {
      const calculatedProgress = Math.round((nextCompleted.size / totalLessonsCount) * 100);
      fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progress: calculatedProgress,
          status: calculatedProgress === 100 ? "completed" : "active",
        }),
        credentials: "include",
      }).catch((e) => console.error(e));
    }
  };

  if (loading || !course) {
    return (
      <div className="container page-padding text-center">
        <h2>Loading classroom...</h2>
      </div>
    );
  }

  const sections = course.sections || [];

  return (
    <div className="classroom-layout">
      <div className="video-main">
        <div className="classroom-header">
          <Link to="/my-courses" className="back-link">
            ← Back to Dashboard
          </Link>
          <h2>{course.title}</h2>
        </div>

        <div className="video-container">
          {activeLesson ? (
            <div className="player-wrapper">
              <video
                key={activeLesson.id}
                controls
                autoPlay
                className="video-player"
                src={activeLesson.video_url || "https://www.w3schools.com/html/mov_bbb.mp4"}
              >
                Your browser does not support HTML5 video.
              </video>
              <div className="lesson-details">
                <h3>{activeLesson.title}</h3>
                <p>{activeLesson.description || "In this lesson, you will learn key concepts and practical implementations."}</p>
                
                <button
                  className={`btn-toggle-complete ${completedLessons.has(activeLesson.id) ? "completed" : ""}`}
                  onClick={() => toggleLessonComplete(activeLesson.id)}
                >
                  {completedLessons.has(activeLesson.id) ? "✓ Completed" : "Mark as Completed"}
                </button>
              </div>
            </div>
          ) : (
            <div className="no-lesson">Select a lesson to begin watching</div>
          )}
        </div>
      </div>

      <div className="curriculum-sidebar">
        <div className="sidebar-header">
          <h3>Course Content</h3>
        </div>

        <div className="sidebar-sections">
          {sections.map((section) => (
            <div key={section.id} className="section-group">
              <h4 className="section-title">{section.title}</h4>
              <div className="lessons-list">
                {(section.lessons || []).map((lesson) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isDone = completedLessons.has(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className={`lesson-item ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
                      onClick={() => setActiveLesson(lesson)}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleLessonComplete(lesson.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="lesson-info">
                        <span className="lesson-name">{lesson.title}</span>
                        <span className="lesson-time">⏱ {lesson.duration || "10 mins"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Learning;
