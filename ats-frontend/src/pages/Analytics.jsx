
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

    if (loading) {
        return <div>Loading analytics...</div>;
    }

    return (
        <div>
            <h1>Analytics & Reports</h1>

            <hr />

            <h2>Applications Per Job</h2>

            {applicationsPerJob.length === 0 ? (
                <p>No application data available.</p>
            ) : (
                <div>
                    {applicationsPerJob.map((job) => (
                        <div key={job.id}>
                            <p>
                                <strong>{job.title}</strong>
                                {" - "}
                                Applications:{" "}
                                {job._count?.applications || 0}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <hr />

            <h2>Hiring Funnel</h2>

            {hiringFunnel.length === 0 ? (
                <p>No hiring funnel data available.</p>
            ) : (
                <div>
                    {hiringFunnel.map((item) => (
                        <div key={item.status}>
                            <p>
                                <strong>{item.status}</strong>
                                {" - "}
                                {item._count?._all || 0} applications
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <hr />

            <h2>Time To Hire</h2>

            {timeToHire.length === 0 ? (
                <p>No hired candidates yet.</p>
            ) : (
                <div>
                    {timeToHire.map((item) => (
                        <div key={item.applicationId}>
                            <p>
                                <strong>{item.jobTitle}</strong>
                                {" - "}
                                {item.daysToHire} days
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <hr />

            <h2>Offer Acceptance Rate</h2>

            {offerAcceptanceRate ? (
                <div>
                    <p>
                        Total Offers:{" "}
                        {offerAcceptanceRate.totalOffers}
                    </p>

                    <p>
                        Accepted Offers:{" "}
                        {offerAcceptanceRate.acceptedOffers}
                    </p>

                    <p>
                        Acceptance Rate:{" "}
                        {offerAcceptanceRate.acceptanceRate}%
                    </p>
                </div>
            ) : (
                <p>No offer data available.</p>
            )}

            <hr />

            <h2>Recruiter Performance</h2>

            {recruiterPerformance.length === 0 ? (
                <p>No recruiter performance data available.</p>
            ) : (
                <div>
                    {recruiterPerformance.map((recruiter) => (
                        <div key={recruiter.recruiterId}>
                            <p>
                                <strong>
                                    {recruiter.recruiterName}
                                </strong>
                            </p>

                            <p>
                                Email:{" "}
                                {recruiter.recruiterEmail}
                            </p>

                            <p>
                                Applications Moved:{" "}
                                {recruiter.applicationsMoved}
                            </p>

                            <p>
                                Candidates Hired:{" "}
                                {recruiter.candidatesHired}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <hr />

            <h2>Open Positions</h2>

            {openPositions.length === 0 ? (
                <p>No open positions.</p>
            ) : (
                <div>
                    {openPositions.map((job) => (
                        <div key={job.id}>
                            <p>
                                <strong>{job.title}</strong>
                            </p>

                            <p>
                                Location: {job.location || "Not specified"}
                            </p>

                            <p>
                                Employment Type:{" "}
                                {job.employmentType}
                            </p>

                            <p>
                                Applications:{" "}
                                {job._count?.applications || 0}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <hr />

            <h2>Candidate Sources</h2>

            {candidateSources.length === 0 ? (
                <p>No candidate source data available.</p>
            ) : (
                <div>
                    {candidateSources.map((source) => (
                        <div key={source.source}>
                            <p>
                                <strong>
                                    {source.source}
                                </strong>
                                {" - "}
                                {source._count?._all || 0} applications
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Analytics;
