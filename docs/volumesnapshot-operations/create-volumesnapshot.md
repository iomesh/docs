---
id: create-volumesnapshot
title: Create VolumeSnapshot
sidebar_label: Create VolumeSnapshot
---

A VolumeSnapshot is a request for snapshot of a volume and similar to a PVC, while a VolumeSnapshotContent is the snapshot taken from a volume provisioned in the cluster. 

**Prerequisite**

Ensure that there is already a SnapshotClass.

**Procedure**

1. Create a YAML config `snapshot.yaml`. Specify the SnapshotClass and PVC.

    ```yaml
    # Source: snapshot.yaml
    apiVersion: snapshot.storage.k8s.io/v1
    kind: VolumeSnapshot
    metadata:
      name: example-snapshot
    spec:
      volumeSnapshotClassName: iomesh-csi-driver # Specify a SnapshotClass such as `iomesh-csi-driver`.
      source:
        persistentVolumeClaimName: mongodb-data-pvc # Specify the PVC for which you want to take a snapshot such as `mongodb-data-pvc`.
    ```
2. Apply the YAML config to create a VolumeSnapshot.

    ```bash
    kubectl apply -f snapshot.yaml
    ```

3. When the VolumeSnapshot is created, the corresponding VolumeSnapshotContent will be created by IOMesh. Run the following command to verify that they were both created.

    ```bash
    kubectl get Volumesnapshots example-snapshot
    ```

    If successful, you should see output like this:

    ```output
    NAME               SOURCEPVC            RESTORESIZE    SNAPSHOTCONTENT                                    CREATIONTIME
    example-snapshot   mongodb-data-pvc     6Gi            snapcontent-fb64d696-725b-4f1b-9847-c95e25b68b13   10h
    ```
