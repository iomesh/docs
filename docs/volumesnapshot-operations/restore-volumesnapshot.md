---
id: restore-volumesnapshot
title: Restore VolumeSnapshot
sidebar_label: Restore VolumeSnapshot
---


Restoring a VolumeSnapshot means creating a PVC while specifying the `dataSource` field referencing to the target snapshot. 

**Precaution**

The storage capacity value in the new PV should be the same as that of the source PV.

**Procedure**

1. Create a YAML config `restore.yaml`. 

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: example-restore 
    spec:
      storageClassName: iomesh-csi-driver 
      dataSource:
        name: example-snapshot # Specify the target VolumeSnapshot.
        kind: VolumeSnapshot
        apiGroup: snapshot.storage.k8s.io
      accessModes:
        - ReadWriteOnce # Must be same as the access mode in the VolumeSnapshot.
      resources:
        requests:
          storage: 6Gi # Must be same as the storage value in the VolumeSnapshot.
    ```

2. Apply the YAML config to create the PVC.

    ```bash
    kubectl apply -f restore.yaml
    ```
3. Check the PVC. A PV will be created and bounded to this PVC.

    ```
    kubectl get pvc example-restore
    ```
   After running the command, you should see an example like:
    ```output
    NAME                                        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
    example-restore                             Bound    pvc-54230f3f-47dc-46e8-8c42-38c073c40598   6Gi        RWO            iomesh-csi-driver   21h   
    ```
4. View the PV. 
    ```bash
    kubectl get pv pvc-54230f3f-47dc-46e8-8c42-38c073c40598 # The PV name you get in Step 3.
    ```
    ```output
    NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM                 STORAGECLASS
    pvc-54230f3f-47dc-46e8-8c42-38c073c40598   6Gi        Delete           Bound    example-restore       iomesh-csi-driver
    ```