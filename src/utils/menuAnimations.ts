import { gsap } from 'gsap';

// Initialize expanding circles animation
export const initExpandingCircles = (element: HTMLElement) => {
  const circles = element.querySelectorAll('.circle:not(.extra):not(.micro)');
  const extraCircles = element.querySelectorAll('.circle.extra');
  const microCircles = element.querySelectorAll('.circle.micro');
  const centerX = 30; // Center X position
  const centerY = 30; // Center Y position
  const radius = 15; // Radius for the initial circle

  // Position the initial 6 circles in a perfect circle
  circles.forEach((circle, i) => {
    const angle = (i * 60 * Math.PI) / 180; // 60 degrees apart
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    gsap.set(circle, {
      left: x,
      top: y,
      xPercent: -50,
      yPercent: -50
    });
  });

  // Hide the extra circles initially
  gsap.set(extraCircles, {
    opacity: 0,
    scale: 0
  });

  // Hide the micro circles initially
  gsap.set(microCircles, {
    opacity: 0,
    scale: 0
  });
};

export const activateExpandingCircles = (element: HTMLElement) => {
  const circles = element.querySelectorAll('.circle:not(.extra):not(.micro)');
  const extraCircles = element.querySelectorAll('.circle.extra');
  const microCircles = element.querySelectorAll('.circle.micro');
  const centerX = 30; // Center X position
  const centerY = 30; // Center Y position

  // Kill any existing animations
  gsap.killTweensOf(circles);
  gsap.killTweensOf(extraCircles);
  gsap.killTweensOf(microCircles);
  gsap.killTweensOf(element);

  // Create a timeline for the animation
  const tl = gsap.timeline();

  // STEP 1: Start rotating the initial circle formation with acceleration
  tl.to(element, {
    rotation: 360, // Full rotation
    duration: 1.2, // Longer duration for more control
    ease: "power1.inOut" // Slow start, fast middle, slow end
  });

  // STEP 2: During the fastest part of the rotation (middle), add the extra circles
  const radius = 15; // Same radius as initial circles
  
  // Position the extra circles at 30, 90, 150, 210, 270, 330 degrees (between the original circles)
  extraCircles.forEach((circle, index) => {
    const angle = ((index * 60 + 30) * Math.PI) / 180; // 60 degrees apart, offset by 30 degrees
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // Position and show the extra circles during the fastest part of the rotation
    tl.to(
      circle,
      {
        left: x,
        top: y,
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        scale: 1,
        duration: 0.1, // Very fast appearance
        ease: "power1.out"
      },
      0.5
    ); // Start at the middle of the rotation (fastest part)
  });

  // STEP 3: Very quickly show the micro circles to fill the gaps
  microCircles.forEach((circle, index) => {
    const angle = (index * 30 * Math.PI) / 180; // 30 degrees apart for more density
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // Position and show the micro circles with a very fast animation
    tl.to(
      circle,
      {
        left: x,
        top: y,
        xPercent: -50,
        yPercent: -50,
        opacity: 0.8,
        scale: 1,
        duration: 0.05, // Extremely fast appearance
        ease: "power1.out"
      },
      0.55
    ); // Right after the extra circles, still during the fastest part
  });

  // STEP 4: Scale down all circles slightly to make room
  tl.to(
    [...circles, ...extraCircles],
    {
      scale: 0.8,
      duration: 0.1, // Very fast scale
      ease: "power1.inOut"
    },
    0.55
  ); // At the same time as the micro circles
};

export const deactivateExpandingCircles = (element: HTMLElement) => {
  const circles = element.querySelectorAll('.circle:not(.extra):not(.micro)');
  const extraCircles = element.querySelectorAll('.circle.extra');
  const microCircles = element.querySelectorAll('.circle.micro');

  // Create a timeline for the reverse animation
  const tl = gsap.timeline();

  // STEP 1: Start rotating back
  tl.to(element, {
    rotation: 720, // Two full rotations for the reverse
    duration: 1.2,
    ease: "power1.inOut"
  });

  // STEP 2: Hide the micro circles first
  tl.to(
    microCircles,
    {
      opacity: 0,
      scale: 0,
      duration: 0.2,
      ease: "power1.in"
    },
    0.3
  );

  // STEP 3: Scale up the remaining circles back to original size
  tl.to(
    [...circles, ...extraCircles],
    {
      scale: 1,
      duration: 0.2,
      ease: "power1.out"
    },
    0.4
  );

  // STEP 4: Hide the extra circles
  tl.to(
    extraCircles,
    {
      opacity: 0,
      scale: 0,
      duration: 0.2,
      ease: "power1.in"
    },
    0.5
  );
};