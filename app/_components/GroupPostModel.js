import styles from "./GroupPostModel.module.css";
import MediaGrid from "./MediaGrid";
import MediaModal from "./MediaModal";

function GroupPostModel({
  post,
  modalMedia,
  setModalMedia,
  setModalIndex,
  modalIndex,
}) {
  return (
    <div className={`${styles.post} card`}>
      <div className={styles.postSContainer}>
        <div className={`${styles.topRightIcons} just-flex`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="-0.565 -0.565 18 18"
            id="Horizontal-Menu-Square--Streamline-Sharp"
            height={18}
            width={18}
          >
            <g id="horizontal-menu-square--navigation-dots-three-square-button-horizontal-menu">
              <path
                id="Rectangle 893"
                stroke="#000000"
                d="M1.4058333333333333 1.4058333333333333h14.058333333333334v14.058333333333334H1.4058333333333333z"
                strokeWidth={1.13}
              />
              <path
                id="Vector 2975"
                stroke="#000000"
                d="M5.096145833333333 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                strokeWidth={1.13}
              />
              <path
                id="Vector 2976"
                stroke="#000000"
                d="M8.610729166666665 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                strokeWidth={1.13}
              />
              <path
                id="Vector 2977"
                stroke="#000000"
                d="M12.1253125 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                strokeWidth={1.13}
              />
            </g>
          </svg>
        </div>

        <div className={`${styles.postUserInfo} just-flex`}>
          <div className={styles.postUserImgAndGroup}>
            <img src={`${post.group.coverImage}`} alt="Group picture" />
            <img src={`${post?.author?.profilePic}`} alt="User Profile" />
          </div>

          <div className={styles.userInfo}>
            <p className={`${styles.postUserName}  paragraph-lg`}>
              <span className="strong">{post.group.name}</span> ||{" "}
              {post.author.name}
            </p>
            <p className={`${styles.postsDate} paragraph-md muted`}>
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className={styles.postContent}>
          <p className={`paragraph-lg ${styles.postContentText}`}>
            {post.text}
          </p>

          {post.media.length > 0 && (
            <>
              <MediaGrid
                media={post.media}
                onMediaClick={(i) => {
                  setModalMedia(post.media);
                  setModalIndex(i);
                }}
              />
              {modalMedia.length > 0 && (
                <MediaModal
                  media={modalMedia}
                  currentIndex={modalIndex}
                  onClose={() => setModalMedia([])}
                  onNavigate={(i) => setModalIndex(i)}
                />
              )}
            </>
          )}
        </div>

        <div className={`${styles.postStatus} just-flex`}>
          <div className={`${styles.statusBox} just-flex`}>
            <div className="just-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-0.565 -0.565 18 18"
                id="Like-1--Streamline-Sharp"
                height={18}
                width={18}
                fill="#0067ff"
              >
                <g id="like-1--reward-social-up-rating-media-like-thumb-hand">
                  <path
                    id="Vector 33"
                    stroke="#0067ff"
                    fill="#0067ff"
                    d="M4.217499999999999 8.083541666666667 4.217499999999999 14.761249999999999"
                    strokeWidth={1.13}
                  />
                  <path
                    id="Vector 34"
                    // stroke="#000000"
                    d="M13.706875 14.761249999999999H1.4058333333333333v-6.677708333333333h2.8116666666666665L5.9747916666666665 2.1087499999999997h0.632625A2.5305 2.5305 0 0 1 9.137916666666666 4.63925V6.32625h6.32625l-1.7572916666666667 8.434999999999999Z"
                    strokeWidth={1.13}
                  />
                </g>
              </svg>

              <p className="paragraph-md strong">1.4k</p>
            </div>
          </div>

          <div className={`${styles.statusBox} just-flex`}>
            <div className="just-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.565 -0.565 18 18"
                id="Chat-Two-Bubbles-Oval--Streamline-Sharp"
                height={18}
                width={18}
              >
                <g id="chat-two-bubbles-oval--messages-message-bubble-chat-oval-conversation">
                  <path
                    id="Ellipse 331"
                    stroke="#000000"
                    d="M4.920416666666666 14.058333333333334H1.4058333333333333l1.4409791666666665 -2.3055666666666665A6.32625 6.32625 0 1 1 13.400403333333333 4.920416666666666"
                    strokeWidth={1.13}
                  />
                  <path
                    id="Ellipse 332"
                    stroke="#000000"
                    d="M10.895208333333333 15.464166666666666a4.568958333333333 4.568958333333333 0 1 1 3.5286416666666662 -1.6659125L15.464166666666666 15.464166666666666l-4.568958333333333 0Z"
                    strokeWidth={1.13}
                  />
                </g>
              </svg>

              <p className="paragraph-md strong">235</p>
            </div>
          </div>

          <div className={`${styles.statusBox} just-flex`}>
            <div className="just-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.565 -0.565 18 18"
                id="Link-Share-2--Streamline-Sharp"
                height={18}
                width={18}
              >
                <g id="link-share-2--create-hyperlink-link-make-unlink-square">
                  <path
                    id="Vector 1312"
                    stroke="#000000"
                    d="M8.434999999999999 3.5145833333333334H1.4058333333333333v11.949583333333333h11.949583333333333V8.434999999999999"
                    strokeWidth={1.13}
                  />
                  <path
                    id="Vector 1309"
                    stroke="#000000"
                    d="M7.029166666666667 9.840833333333332 15.464166666666666 1.4058333333333333"
                    strokeWidth={1.13}
                  />
                  <path
                    id="Vector 1310"
                    stroke="#000000"
                    d="M9.840833333333332 1.4058333333333333h5.623333333333333v5.623333333333333"
                    strokeWidth={1.13}
                  />
                </g>
              </svg>

              <p className="paragraph-md">Share</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupPostModel;
