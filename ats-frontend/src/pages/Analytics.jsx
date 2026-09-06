
import { useEffect, useState } from "react";
import api from "../api/axios";

function Analytics() {
    const [applicationsPerJob, setApplicationsPerJob] = useState([]);
    const [hiringFunnel, setHiringFunnel] = useState([]);
    const [timeToHire, setTimeToHire] = useState([]);
    const [offerAcceptanceRate, setOfferAcceptanceRate] = useState(null);
    const [recruiterPerformance, setRecruiterPerformance] = useState([]);
    const [openPositions, setOpenPositions] = useState([]);
    const [candidateSources, setCandidateSources] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const [
                    applicationsResponse,
                    funnelResponse,
                    timeToHireResponse,
                    offerResponse,
                    recruiterResponse,
                    positionsResponse,
                    sourcesResponse
                ] = await Promise.all([
                    api.get("/analytics/applications-per-job"),
                    api.get("/analytics/hiring-funnel"),
                    api.get("/analytics/time-to-hire"),
                    api.get("/analytics/offer-acceptance-rate"),
                    api.get("/analytics/recruiter-performance"),
                    api.get("/analytics/open-positions"),
                    api.get("/analytics/candidate-sources")
                ]);

                setApplicationsPerJob(
                    applicationsResponse.data.data || []
                );

                setHiringFunnel(
                    funnelResponse.data.data || []
                );

                setTimeToHire(
                    timeToHireResponse.data.data || []
                );

                setOfferAcceptanceRate(
                    offerResponse.data.data || null
                );

                setRecruiterPerformance(
                    recruiterResponse.data.data || []
                );

                setOpenPositions(
                    positionsResponse.data.data || []
                );

                setCandidateSources(
                    sourcesResponse.data.data || []
                );
            } catch (error) {
                console.error(
                    "Failed to fetch analytics:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Failed to fetch analytics"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    function formatLabel(value) {
        if (!value) return "Unknown";

        return value
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    }

    function getApplicationsCount(job) {
        return job._count?.applications || 0;
    }

    function getFunnelCount(item) {
        return item._count?._all || 0;
    }

    const totalApplications = applicationsPerJob.reduce(
        (total, job) =>
            total + getApplicationsCount(job),
        0
    );

    const totalOpenPositions = openPositions.length;

    const totalHired = hiringFunnel.find(
        (item) => item.status === "HIRED"
    );

    const hiredCount = totalHired
        ? getFunnelCount(totalHired)
        : 0;

    const averageTimeToHire =
        timeToHire.length > 0
            ? (
                  timeToHire.reduce(
                      (total, item) =>
                          total + Number(item.daysToHire || 0),
                      0
                  ) / timeToHire.length
              ).toFixed(1)
            : 0;

    if (loading) {
        return (
            <div className="page">
                <div className="analytics-loading">
                    <div className="analytics-loading-icon">
                        ◈
                    </div>

                    <h2>Loading analytics</h2>

                    <p>
                        Preparing your hiring insights...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">

            <div className="page-header analytics-header">

                <div>
                    <p className="page-eyebrow">
                        REPORTING & INSIGHTS
                    </p>

                    <h1>Analytics & Reports</h1>

                    <p className="analytics-subtitle">
                        Track hiring activity, candidate flow,
                        recruiter performance, and open positions.
                    </p>
                </div>

            </div>

            <section className="analytics-kpis">

                <div className="analytics-kpi-card">
                    <span className="analytics-kpi-icon">
                        ◉
                    </span>

                    <div>
                        <span>Total Applications</span>
                        <strong>{totalApplications}</strong>
                    </div>
                </div>

                <div className="analytics-kpi-card">
                    <span className="analytics-kpi-icon">
                        ◫
                    </span>

                    <div>
                        <span>Open Positions</span>
                        <strong>{totalOpenPositions}</strong>
                    </div>
                </div>

                <div className="analytics-kpi-card">
                    <span className="analytics-kpi-icon">
                        ✓
                    </span>

                    <div>
                        <span>Candidates Hired</span>
                        <strong>{hiredCount}</strong>
                    </div>
                </div>

                <div className="analytics-kpi-card">
                    <span className="analytics-kpi-icon">
                        ◷
                    </span>

                    <div>
                        <span>Avg. Time to Hire</span>
                        <strong>
                            {averageTimeToHire}
                            <small> days</small>
                        </strong>
                    </div>
                </div>

            </section>

            <section className="analytics-grid analytics-grid-top">

                <div className="analytics-panel">

                    <div className="analytics-panel-header">
                        <div>
                            <h2>Hiring Funnel</h2>
                            <p>
                                Applications across each hiring stage.
                            </p>
                        </div>
                    </div>

                    {hiringFunnel.length === 0 ? (
                        <div className="analytics-empty-small">
                            No hiring funnel data available.
                        </div>
                    ) : (
                        <div className="funnel-list">

                            {hiringFunnel.map((item) => {

                                const count =
                                    getFunnelCount(item);

                                const maximum =
                                    Math.max(
                                        ...hiringFunnel.map(
                                            (entry) =>
                                                getFunnelCount(entry)
                                        ),
                                        1
                                    );

                                const percentage =
                                    (count / maximum) * 100;

                                return (
                                    <div
                                        className="funnel-item"
                                        key={item.status}
                                    >

                                        <div className="funnel-label">
                                            <span>
                                                {formatLabel(
                                                    item.status
                                                )}
                                            </span>

                                            <strong>
                                                {count}
                                            </strong>
                                        </div>

                                        <div className="funnel-bar">
                                            <div
                                                className="funnel-bar-fill"
                                                style={{
                                                    width: `${percentage}%`
                                                }}
                                            />
                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    )}

                </div>

                <div className="analytics-panel">

                    <div className="analytics-panel-header">
                        <div>
                            <h2>Offer Acceptance</h2>
                            <p>
                                Overview of your offer conversion.
                            </p>
                        </div>
                    </div>

                    {offerAcceptanceRate ? (
                        <div className="offer-analytics">

                            <div className="offer-rate">
                                <strong>
                                    {offerAcceptanceRate.acceptanceRate ??
                                        0}
                                    %
                                </strong>

                                <span>
                                    Acceptance Rate
                                </span>
                            </div>

                            <div className="offer-stats">

                                <div>
                                    <span>Total Offers</span>
                                    <strong>
                                        {
                                            offerAcceptanceRate.totalOffers
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>Accepted</span>
                                    <strong>
                                        {
                                            offerAcceptanceRate.acceptedOffers
                                        }
                                    </strong>
                                </div>

                            </div>

                        </div>
                    ) : (
                        <div className="analytics-empty-small">
                            No offer data available.
                        </div>
                    )}

                </div>

            </section>

            <section className="analytics-panel analytics-section">

                <div className="analytics-panel-header">
                    <div>
                        <h2>Applications Per Job</h2>
                        <p>
                            Compare application volume across your
                            positions.
                        </p>
                    </div>

                    <span className="analytics-record-count">
                        {applicationsPerJob.length} jobs
                    </span>
                </div>

                {applicationsPerJob.length === 0 ? (
                    <div className="analytics-empty-small">
                        No application data available.
                    </div>
                ) : (
                    <div className="analytics-job-table-wrapper">

                        <table className="analytics-table">

                            <thead>
                                <tr>
                                    <th>Job</th>
                                    <th>Applications</th>
                                    <th>Volume</th>
                                </tr>
                            </thead>

                            <tbody>
                                {applicationsPerJob.map((job) => {

                                    const count =
                                        getApplicationsCount(job);

                                    const maximum =
                                        Math.max(
                                            ...applicationsPerJob.map(
                                                (item) =>
                                                    getApplicationsCount(
                                                        item
                                                    )
                                            ),
                                            1
                                        );

                                    return (
                                        <tr key={job.id}>

                                            <td>
                                                <strong>
                                                    {job.title}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="analytics-number">
                                                    {count}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="table-progress">
                                                    <div
                                                        style={{
                                                            width: `${
                                                                (count /
                                                                    maximum) *
                                                                100
                                                            }%`
                                                        }}
                                                    />
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>

                    </div>
                )}

            </section>

            <section className="analytics-grid">

                <div className="analytics-panel">

                    <div className="analytics-panel-header">
                        <div>
                            <h2>Candidate Sources</h2>
                            <p>
                                Where your applicants are coming from.
                            </p>
                        </div>
                    </div>

                    {candidateSources.length === 0 ? (
                        <div className="analytics-empty-small">
                            No candidate source data available.
                        </div>
                    ) : (
                        <div className="source-list">

                            {candidateSources.map((source) => (

                                <div
                                    className="source-row"
                                    key={source.source}
                                >

                                    <div className="source-name">
                                        <span className="source-icon">
                                            ↗
                                        </span>

                                        <strong>
                                            {formatLabel(
                                                source.source
                                            )}
                                        </strong>
                                    </div>

                                    <span className="source-count">
                                        {getFunnelCount(source)}
                                    </span>

                                </div>

                            ))}

                        </div>
                    )}

                </div>

                <div className="analytics-panel">

                    <div className="analytics-panel-header">
                        <div>
                            <h2>Time to Hire</h2>
                            <p>
                                Hiring duration for completed hires.
                            </p>
                        </div>
                    </div>

                    {timeToHire.length === 0 ? (
                        <div className="analytics-empty-small">
                            No hired candidates yet.
                        </div>
                    ) : (
                        <div className="time-hire-list">

                            {timeToHire.map((item) => (

                                <div
                                    className="time-hire-row"
                                    key={item.applicationId}
                                >

                                    <div>
                                        <strong>
                                            {item.jobTitle}
                                        </strong>

                                        <span>
                                            Application #
                                            {item.applicationId}
                                        </span>
                                    </div>

                                    <strong className="time-hire-days">
                                        {item.daysToHire} days
                                    </strong>

                                </div>

                            ))}

                        </div>
                    )}

                </div>

            </section>

            <section className="analytics-panel analytics-section">

                <div className="analytics-panel-header">
                    <div>
                        <h2>Recruiter Performance</h2>
                        <p>
                            Activity and hiring outcomes by recruiter.
                        </p>
                    </div>

                    <span className="analytics-record-count">
                        {recruiterPerformance.length} recruiters
                    </span>
                </div>

                {recruiterPerformance.length === 0 ? (
                    <div className="analytics-empty-small">
                        No recruiter performance data available.
                    </div>
                ) : (
                    <div className="recruiter-table-wrapper">

                        <table className="analytics-table">

                            <thead>
                                <tr>
                                    <th>Recruiter</th>
                                    <th>Email</th>
                                    <th>Applications Moved</th>
                                    <th>Candidates Hired</th>
                                </tr>
                            </thead>

                            <tbody>

                                {recruiterPerformance.map(
                                    (recruiter) => (

                                        <tr
                                            key={
                                                recruiter.recruiterId
                                            }
                                        >

                                            <td>
                                                <div className="recruiter-cell">

                                                    <div className="recruiter-avatar">
                                                        {recruiter
                                                            .recruiterName
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <strong>
                                                        {
                                                            recruiter.recruiterName
                                                        }
                                                    </strong>

                                                </div>
                                            </td>

                                            <td>
                                                <span className="analytics-muted">
                                                    {
                                                        recruiter.recruiterEmail
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <span className="analytics-number">
                                                    {
                                                        recruiter.applicationsMoved
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <span className="analytics-hired-badge">
                                                    {
                                                        recruiter.candidatesHired
                                                    }
                                                </span>
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

            <section className="analytics-panel analytics-section">

                <div className="analytics-panel-header">
                    <div>
                        <h2>Open Positions</h2>
                        <p>
                            Currently active positions and their
                            application volume.
                        </p>
                    </div>

                    <span className="analytics-record-count">
                        {openPositions.length} open
                    </span>
                </div>

                {openPositions.length === 0 ? (
                    <div className="analytics-empty-small">
                        No open positions.
                    </div>
                ) : (
                    <div className="open-positions-grid">

                        {openPositions.map((job) => (

                            <div
                                className="open-position-card"
                                key={job.id}
                            >

                                <div className="open-position-icon">
                                    ◫
                                </div>

                                <div className="open-position-content">

                                    <h3>{job.title}</h3>

                                    <div className="open-position-meta">

                                        <span>
                                            📍{" "}
                                            {job.location ||
                                                "Not specified"}
                                        </span>

                                        <span>
                                            {formatLabel(
                                                job.employmentType
                                            )}
                                        </span>

                                    </div>

                                    <div className="open-position-applications">

                                        <span>
                                            Applications
                                        </span>

                                        <strong>
                                            {getApplicationsCount(job)}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}

export default Analytics;
